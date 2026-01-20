using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
// Specific alias to fix the CS0104 error
using Timer = System.Timers.Timer; 
using Newtonsoft.Json;
using System.Drawing;
using System.Drawing.Imaging;
using System.Windows.Forms;
using System.IO;
using RestSharp;

class AgentConfig
{
    public string userId { get; set; }
    public string backendUrl { get; set; }
    public int thresholdCPU { get; set; }
    public int thresholdRAM { get; set; }
    public bool parentControl { get; set; }
    public string email { get; set; }
}

class Program
{
    static AgentConfig config;
    static Timer timer;
    static PerformanceCounter cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
    static PerformanceCounter ramCounter = new PerformanceCounter("Memory", "% Committed Bytes In Use");

    [STAThread]
    static async Task Main(string[] args)
    {
        // Check if config exists to avoid crash
        if (!File.Exists("config.json"))
        {
            Console.WriteLine("Error: config.json not found!");
            return;
        }

        LoadConfig();

        // Warm up the CPU counter (first call always returns 0)
        cpuCounter.NextValue();

        timer = new Timer(30000); // 30 seconds
        timer.Elapsed += async (sender, e) => await CollectAndSend();
        timer.AutoReset = true;
        timer.Start();

        Console.WriteLine("Agent running in background... Press Ctrl+C to stop.");
        await Task.Delay(-1); // Keep the console app alive
    }

    static void LoadConfig()
    {
        string json = File.ReadAllText("config.json");
        config = JsonConvert.DeserializeObject<AgentConfig>(json);
    }

    static async Task CollectAndSend()
    {
        float cpu = cpuCounter.NextValue();
        float ram = ramCounter.NextValue();

        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] CPU: {cpu:0.0}%, RAM: {ram:0.0}%");

        await SendUsage(cpu, ram);

        if (config.parentControl)
        {
            if (cpu > config.thresholdCPU || ram > config.thresholdRAM)
            {
                Console.WriteLine("Threshold exceeded! Taking screenshot...");
                TakeScreenshot();
            }
        }
    }

    static async Task SendUsage(float cpu, float ram)
    {
        try 
        {
            var client = new RestClient(config.backendUrl);
            var request = new RestRequest("/system/submit-usage", Method.Post);
            request.AddJsonBody(new
            {
                userId = config.userId,
                cpu = Math.Round(cpu, 2),
                ram = Math.Round(ram, 2),
                disk = 0
            });

            await client.ExecuteAsync(request);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending usage: {ex.Message}");
        }
    }

    static void TakeScreenshot()
    {
        try 
        {
            // Screen.PrimaryScreen requires 'net10.0-windows' and 'UseWindowsForms'
            Bitmap screenshot = new Bitmap(Screen.PrimaryScreen.Bounds.Width,
                                           Screen.PrimaryScreen.Bounds.Height);

            using (Graphics g = Graphics.FromImage(screenshot))
            {
                g.CopyFromScreen(0, 0, 0, 0, screenshot.Size);
            }

            string path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, $"screenshot-{DateTime.Now.Ticks}.jpg");
            screenshot.Save(path, ImageFormat.Jpeg);
            screenshot.Dispose(); // Clean up memory

            UploadScreenshot(path);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Screenshot failed: {ex.Message}");
        }
    }

    static void UploadScreenshot(string filePath)
    {
        var client = new RestClient(config.backendUrl);
        var request = new RestRequest("/notify/upload-screenshot", Method.Post);

        request.AddParameter("userId", config.userId);
        request.AddFile("screenshot", filePath);

        client.ExecuteAsync(request);
        NotifyEmail(filePath);
    }

    static void NotifyEmail(string filePath)
    {
        if (string.IsNullOrEmpty(config.email)) return;

        var client = new RestClient(config.backendUrl);
        var request = new RestRequest("/notify/send-email", Method.Post);

        request.AddJsonBody(new
        {
            email = config.email,
            screenshotPath = Path.GetFileName(filePath)
        });

        client.ExecuteAsync(request);
    }
}