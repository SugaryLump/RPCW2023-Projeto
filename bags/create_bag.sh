bagit.py "$1" --md5
rm "$1"/bag* "$1"/tag*
zip -r "$1".zip "$1"
