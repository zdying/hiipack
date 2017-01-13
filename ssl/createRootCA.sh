#!/usr/bin/env bash
rm -rdf ./cert
mkdir cert

read -p "Enter your file name [rootCA]: " CA_NAME

DEFAULT_CA_NAME="rootCA"
CA_NAME=${CA_NAME:-$DEFAULT_CA_NAME}

echo "Create the Root Key ..."
openssl genrsa -out ./cert/$CA_NAME.key 2048

echo "self-sign this certificate ..."
SUBJECT="/C=CN/ST=BeiJing/L=HaiDian/O=$CA_NAME/OU=DEV/CN=$CA_NAME/emailAddress=zdying@live.com"
openssl req -x509 -new -subj $SUBJECT -nodes -key ./cert/$CA_NAME.key -sha256 -days 1024 -out ./cert/$CA_NAME.pem