npm install -g firebase-tools
firebase deploy --token $(firebase.token) --project $(firebase.project) -m "$(Build.buildNumber)" --non-interactive --force