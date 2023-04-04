source ~/.nvm/nvm.sh
nvm install 16
nvm use 16
npm install -g firebase-tools
firebase emulators:start --import test/emulator-state
