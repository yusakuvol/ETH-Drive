## How to use

```
python -m venv testvenv
source .venv/bin/activate
pip install pyinstaller 
pyinstaller decrypt.py --onefile --noconsole --icon=icon.icns
```

## gpg set up

### gpg command install
```
brew install gpg pinentry-mac gpg-agent
```

### register key pairs
```
gpg --import private-key-file # register private key
gpg -K # display private key
gpg -k # display public key
```

### delete keys
```
gpg --delete-secret-keys {id} # delete private key
gpg --delete-keys {id} # delete public key
```
