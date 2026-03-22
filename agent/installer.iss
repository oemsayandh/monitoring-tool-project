[Setup]
AppName=Zero Test Agent
AppVersion=1.0
DefaultDirName={pf}\ZeroTest
DefaultGroupName=Zero Test
OutputBaseFilename=ZeroTestSetup
OutputDir=output
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Files]
Source: "C:\Users\dell\Documents\project structre\main test\agent\bin\Release\net10.0-windows\win-x64\publish\agent.exe"; DestDir: "{app}"; DestName: "ZeroTestAgent.exe"; Flags: ignoreversion

[Icons]
Name: "{commondesktop}\Zero Test Agent"; Filename: "{app}\ZeroTestAgent.exe"

[Code]
var
  UserIdPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  UserIdPage := CreateInputQueryPage(
    wpWelcome,
    'Your User ID',
    'Enter your Zero Test User ID',
    'Copy your User ID from the dashboard by clicking the purple ID badge in the top bar.'
  );
  UserIdPage.Add('User ID:', False);
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigPath: String;
  ConfigContent: String;
  UserId: String;
begin
  if CurStep = ssPostInstall then
  begin
    UserId := UserIdPage.Values[0];

    ConfigContent :=
      '{' + #13#10 +
      '  "userId": "' + UserId + '",' + #13#10 +
      '  "backendUrl": "http://localhost:5000",' + #13#10 +
      '  "thresholdCPU": 70,' + #13#10 +
      '  "thresholdRAM": 80,' + #13#10 +
      '  "parentControl": false,' + #13#10 +
      '  "email": ""' + #13#10 +
      '}';

    ConfigPath := ExpandConstant('{app}\config.json');
    SaveStringToFile(ConfigPath, ConfigContent, False);
  end;
end;