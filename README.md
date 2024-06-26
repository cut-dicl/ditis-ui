# DITIS UI - Distributed Tiered Storage Simulator UI

DITIS is a new comprehensive simulator that models the end-to-end execution of file requests on distributed multi-tier storage systems.

***

## Installation on Windows 10

### Prerequisites

General Prerequisites:
- NodeJS (v20.12.0 LTS) from [https://nodejs.org/en](https://nodejs.org/en)
- Java 17 for DITIS v2.0 when using DITIS UI in local mode

### Compilation of DITIS Application

Execute the `install.bat` script to install the required dependencies.

```bash
install.bat
```

Execute the `build.bat` script to generate the Windows installer and stand-alone executable.

```bash
build.bat
```

***

## Installation on Ubuntu 22.04

### Prerequisites

General Prerequisites:
- NodeJS (v20.12.0 LTS) from [https://nodejs.org/en](https://nodejs.org/en)
- Java 17 for DITIS v2.0 when using DITIS UI in local mode

Install nvm (Node Version Manager) and NodeJS
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. ~/.bashrc
nvm install 20
node -v
npm -v
```

Install Java JDK
```bash
sudo apt install openjdk-17-jdk
java --version
```

### Compilation of DITIS Application

Install the required dependencies.

```bash
cd smml/application
npm i
npm update
```

Generate the stand-alone executable for the UI application.

```bash
call npm i
call npm run build
start "" "build"
```

***


## Usage

### Start DITIS UI in development mode

Execute the `start.bat` script to run DITIS UI in development mode.

```bash
start.bat
```

### Start DITIS UI in production mode

**Option 1**: Navigate to *'application/build'* directory and execute the `ditis Setup 1.0.0.exe` to install DITIS UI locally. You can then run it from the Windows Start Menu.

**Option 2**: Navigate to *'application/build/win-unpacked'* directory and execute the `ditis.exe` to run DITIS UI locally.

## Configuration

The DITIS UI application can either use a local installation of the DITIS v2.0 simulator or an online service providing the DITIS simulation functionalities.

### Running DITIS UI with a local installation of DITIS

1. Start the DITIS UI application
2. From the right main menu, click *'Preferences'*
3. Under *'Simulation Preferences'*, select the option *'Local'* 
4. Under *'Simulator Path'*, click on *'Browse Folder'* and select the folder that contains the DITIS v2.0 jar files
5. Enjoy using DITIS UI

### Running DITIS UI with the DITIS Online Service

1. Start the DITIS UI application
2. From the right main menu, click *'Preferences'*
3. Under *'Simulation Preferences'*, select the option *'Online'* 
4. Under *'Add new server'*, add the required information (server address, username, password, server name) and click *'Add'*
5. For the dropdown *'Select server to use'*, select the added server
6. Enjoy using DITIS UI

***

## Developers
- Sotiris R. Vasileiadis
- Matthew P. Paraskeva

## Contact
- Herodotos Herodotou, Cyprus University of Technology, [https://dicl.cut.ac.cy/](https://dicl.cut.ac.cy/)
