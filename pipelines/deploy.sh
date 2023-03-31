npm install -g firebase-tools@10.8.0
firebase \
    --debug \
    --config \
    ../firebase.json deploy \
    --token $(firebase.token) \
    --project $(firebase.project) \
    --only functions \
    --force -m "$(Build.buildNumber)" \
    --non-interactive
