using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Newtonsoft.Json;
using RestSharp;

class AgentConfig
{
    public string userId { get; set; } = "";
    public string hostCode { get; set; } = "";
    public string backendUrl { get; set; } = "http://localhost:5000";
    public int thresholdCPU { get; set; } = 70;
    public int thresholdRAM { get; set; } = 80;
    public string email { get; set; } = "";
}

class Program
{
    static AgentConfig config = new();
    static NotifyIcon? trayIcon;
    static System.Threading.Timer? collectTimer;

    static PerformanceCounter cpuCounter = new("Processor", "% Processor Time", "_Total");
    static PerformanceCounter ramCounter = new("Memory", "% Committed Bytes In Use");
    static PerformanceCounter? downloadCounter;
    static PerformanceCounter? uploadCounter;

    static float lastCpu = -1;
    static float lastRam = -1;

    static string configPath = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory, "config.json"
    );

    static string logPath = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory, "agent-log.txt"
    );

    [STAThread]
    static void Main()
    {
        Application.SetHighDpiMode(HighDpiMode.SystemAware);
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        if (!File.Exists(configPath))
        {
            MessageBox.Show(
                "config.json not found!\n\n" +
                "Please:\n" +
                "1. Login to the Zero Test dashboard\n" +
                "2. Copy your User ID from the dashboard\n" +
                "3. Re-run the installer with your User ID",
                "Zero Test Agent — Setup Required",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning
            );
            return;
        }

        try
        {
            string json = File.ReadAllText(configPath);
            config = JsonConvert.DeserializeObject<AgentConfig>(json) ?? new AgentConfig();
        }
        catch
        {
            MessageBox.Show(
                "config.json is invalid or corrupted.\nPlease re-download your config from the dashboard.",
                "Zero Test Agent — Config Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
            return;
        }

        if (string.IsNullOrWhiteSpace(config.userId))
        {
            MessageBox.Show(
                "Your config.json is missing a User ID.\nPlease re-download your config from the dashboard.",
                "Zero Test Agent — Invalid Config",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
            return;
        }

        InitCounters();
        SetupTray();

        collectTimer = new System.Threading.Timer(
            async _ => await Collect(),
            null,
            TimeSpan.FromSeconds(5),
            TimeSpan.FromSeconds(60)
        );

        Application.Run();

        collectTimer?.Dispose();
        trayIcon?.Dispose();
        cpuCounter?.Dispose();
        ramCounter?.Dispose();
        downloadCounter?.Dispose();
        uploadCounter?.Dispose();
    }

    static void InitCounters()
    {
        try
        {
            cpuCounter.NextValue();

            var category = new PerformanceCounterCategory("Network Interface");
            string[] instances = category.GetInstanceNames();

            if (instances.Length > 0)
            {
                string iface = instances[0];
                downloadCounter = new PerformanceCounter(
                    "Network Interface", "Bytes Received/sec", iface
                );
                uploadCounter = new PerformanceCounter(
                    "Network Interface", "Bytes Sent/sec", iface
                );
            }
        }
        catch (Exception ex)
        {
            Log($"Counter init error: {ex.Message}");
        }
    }

    static void SetupTray()
    {
        trayIcon = new NotifyIcon
        {
            Icon = SystemIcons.Application,
            Text = "Zero Test Agent — Running",
            Visible = true
        };

        var menu = new ContextMenuStrip();

        var status = new ToolStripMenuItem($"● Monitoring — {config.userId[..Math.Min(8, config.userId.Length)]}...");
        status.Enabled = false;
        menu.Items.Add(status);

        menu.Items.Add(new ToolStripSeparator());

        var logItem = new ToolStripMenuItem("View Log");
        logItem.Click += (s, e) =>
        {
            if (File.Exists(logPath))
                System.Diagnostics.Process.Start("notepad.exe", logPath);
            else
                MessageBox.Show("No log file yet.", "Zero Test Agent");
        };
        menu.Items.Add(logItem);

        menu.Items.Add(new ToolStripSeparator());

        var stopItem = new ToolStripMenuItem("Stop Agent");
        stopItem.Click += (s, e) =>
        {
            trayIcon.Visible = false;
            collectTimer?.Dispose();
            Application.Exit();
        };
        menu.Items.Add(stopItem);

        trayIcon.ContextMenuStrip = menu;

        trayIcon.DoubleClick += (s, e) =>
        {
            trayIcon.BalloonTipTitle = "Zero Test Agent";
            trayIcon.BalloonTipText = $"Running\nUser: {config.userId}\nServer: {config.backendUrl}";
            trayIcon.BalloonTipIcon = ToolTipIcon.Info;
            trayIcon.ShowBalloonTip(3000);
        };

        trayIcon.BalloonTipTitle = "Zero Test Agent";
        trayIcon.BalloonTipText = "Monitoring started — running in background";
        trayIcon.BalloonTipIcon = ToolTipIcon.Info;
        trayIcon.ShowBalloonTip(3000);
    }

    // Fetch parental mode status from backend dynamically
    static async Task<bool> IsParentalModeActive()
    {
        try
        {
            if (string.IsNullOrEmpty(config.hostCode)) return false;

            var client = new RestClient(config.backendUrl);
            var request = new RestRequest($"/agent/room-status/{config.hostCode}", Method.Get);
            var response = await client.ExecuteAsync(request);

            if (response.IsSuccessful && response.Content != null)
            {
                dynamic? result = JsonConvert.DeserializeObject(response.Content);
                if (result != null && result.parentalMode != null)
                {
                    bool isActive = (bool)result.parentalMode;
                    Log($"Parental mode from server: {isActive}");
                    return isActive;
                }
            }
        }
        catch (Exception ex)
        {
            Log($"Parental mode check error: {ex.Message}");
        }
        return false;
    }

    // Fetch parent email from backend
    static async Task<string> GetParentEmail()
    {
        try
        {
            var client = new RestClient(config.backendUrl);
            var request = new RestRequest($"/agent/room-status/{config.hostCode}", Method.Get);
            var response = await client.ExecuteAsync(request);

            if (response.IsSuccessful && response.Content != null)
            {
                dynamic? result = JsonConvert.DeserializeObject(response.Content);
                if (result != null && result.hostEmail != null)
                {
                    return (string)result.hostEmail;
                }
            }
        }
        catch (Exception ex)
        {
            Log($"Get parent email error: {ex.Message}");
        }
        // Fall back to config email if set
        return config.email ?? "";
    }

    static async Task Collect()
    {
        try
        {
            float cpu = (float)Math.Round(cpuCounter.NextValue(), 1);
            float ram = (float)Math.Round(ramCounter.NextValue(), 1);
            float dl = downloadCounter != null
                ? (float)Math.Round(downloadCounter.NextValue() / 1048576f, 2)
                : 0;
            float ul = uploadCounter != null
                ? (float)Math.Round(uploadCounter.NextValue() / 1048576f, 2)
                : 0;

            lastCpu = cpu;
            lastRam = ram;

            Log($"[{DateTime.Now:HH:mm:ss}] CPU:{cpu}% RAM:{ram}% ↓{dl}MB/s ↑{ul}MB/s");

            await SendUsage(cpu, ram, dl, ul);

            // Check parental mode from backend — not from config.json
            bool parentalActive = await IsParentalModeActive();

            if (parentalActive && (cpu > config.thresholdCPU || ram > config.thresholdRAM))
            {
                Log($"Parental mode active + threshold exceeded — taking screenshot...");

                // Update tray to show alert
                if (trayIcon != null)
                    trayIcon.Text = "Zero Test — ⚠ Anomaly detected!";

                string parentEmail = await GetParentEmail();
                TakeAndSendScreenshot(parentEmail);
            }
        }
        catch (Exception ex)
        {
            Log($"Collect error: {ex.Message}");
        }
    }

    static async Task SendUsage(float cpu, float ram, float dl, float ul)
    {
        try
        {
            var client = new RestClient(config.backendUrl);
            var request = new RestRequest("/system/submit-usage", Method.Post);

            request.AddJsonBody(new
            {
                userId = config.userId,
                hostCode = config.hostCode,
                cpu = Math.Round(cpu, 2),
                ram = Math.Round(ram, 2),
                download = Math.Round(dl, 2),
                upload = Math.Round(ul, 2),
                disk = 0
            });

            var response = await client.ExecuteAsync(request);

            if (response.IsSuccessful)
            {
                if (trayIcon != null)
                    trayIcon.Text = $"Zero Test — CPU:{cpu}% RAM:{ram}%";
            }
        }
        catch (Exception ex)
        {
            Log($"Send error: {ex.Message}");
        }
    }

    static void TakeAndSendScreenshot(string emailTo)
    {
        try
        {
            var bounds = Screen.PrimaryScreen?.Bounds ?? new Rectangle(0, 0, 1920, 1080);
            using var bmp = new Bitmap(bounds.Width, bounds.Height);
            using (var g = Graphics.FromImage(bmp))
            {
                g.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighSpeed;
                g.CopyFromScreen(0, 0, 0, 0, bmp.Size);
            }

            string path = Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                $"ss-{DateTime.Now:yyyyMMdd-HHmmss}.jpg"
            );

            var encoder = GetJpegEncoder();
            var encoderParams = new EncoderParameters(1);
            encoderParams.Param[0] = new EncoderParameter(
                System.Drawing.Imaging.Encoder.Quality, 60L
            );

            bmp.Save(path, encoder, encoderParams);
            Log($"Screenshot saved: {path}");

            UploadScreenshot(path, emailTo);
        }
        catch (Exception ex)
        {
            Log($"Screenshot error: {ex.Message}");
        }
    }

    static ImageCodecInfo GetJpegEncoder()
    {
        foreach (var codec in ImageCodecInfo.GetImageEncoders())
            if (codec.FormatID == ImageFormat.Jpeg.Guid)
                return codec;
        return ImageCodecInfo.GetImageEncoders()[0];
    }

    static void UploadScreenshot(string filePath, string emailTo)
    {
        try
        {
            var client = new RestClient(config.backendUrl);
            var request = new RestRequest("/notify/upload-screenshot", Method.Post);
            request.AddParameter("userId", config.userId);
            request.AddFile("screenshot", filePath);
            client.ExecuteAsync(request);

            if (!string.IsNullOrEmpty(emailTo))
            {
                Log($"Sending alert email to: {emailTo}");
                var emailClient = new RestClient(config.backendUrl);
                var emailRequest = new RestRequest("/notify/send-email", Method.Post);
                emailRequest.AddJsonBody(new
                {
                    email = emailTo,
                    screenshotPath = Path.GetFileName(filePath)
                });
                emailClient.ExecuteAsync(emailRequest);
            }

            Task.Delay(5000).ContinueWith(_ =>
            {
                try { File.Delete(filePath); } catch { }
            });
        }
        catch (Exception ex)
        {
            Log($"Upload error: {ex.Message}");
        }
    }

    static void Log(string message)
    {
        try
        {
            if (File.Exists(logPath))
            {
                var lines = File.ReadAllLines(logPath);
                if (lines.Length > 500)
                    File.WriteAllLines(logPath, lines[^250..]);
            }
            File.AppendAllText(logPath, message + Environment.NewLine);
        }
        catch { }
    }
}