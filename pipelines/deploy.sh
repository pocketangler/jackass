npm install -g firebase-tools@10.8.0
echo $1 $2 $3
firebase \
    --debug \
    --config \
    firebase.json deploy \
    --token "$1" \
    --project "$2" \
    --only functions \
    --force -m "$3" \
    --non-interactive
