# useless-captions

in my humble opinion, these style of captions are used for attracting the viewer's attention rather than helping them, hence the name useless-captions.

## setup

clone the entire github project and make sure to have `bun` and `ffmpeg` installed on your system

you're gonna have to run the server in your terminal before you open the software

```shell
# clone and cd into the project
# replace 1.x.0 with the version you've downloaded from https://github.com/FlowGnarly/useless-captions/releases
git clone --branch app-v1.x.0 https://github.com/flowgnarly/useless-captions
cd useless-captions

# cd into the server, install server dependencies
cd server
bun i

# run the server (first time will take a while because it has to download the openai-whisper model)
bun index.ts
```

now that the server is running, you can download the software if you haven't already and open it up.

## troubleshooting

if the server failed to extract the whisper.cpp zip file (found in `./server/`) after downloading it, extract its content manually into `./server/whisper.cpp/` and run the server again

if the server failed to download chrome-headless-shell, copy the download link from the logs and download it manually with a browser, once it finished downloading you can extract it into `./server/node_modules/.remotion/chrome-headless-shell/[your-platform]/chrome-headless-shell-[your-platform]/`

(replace `[your-platform]` with one of `mac-arm64`, `mac-x64, linux64`, `linux-arm64` or `win64`.)

## screenshots

![Editing generated captions](/screenshots/EditingCaptions.png)

![Customizing the text style](/screenshots/CustomizingCaptions.png)

![Rendering the video](/screenshots/Rendering.png)
