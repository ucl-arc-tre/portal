package sign

import (
	"crypto/ed25519"
	"encoding/base64"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Ed25519KeyPair struct {
	id      uuid.UUID
	public  ed25519.PublicKey
	private ed25519.PrivateKey
}

func mustMakeEd25519KeyPair() Ed25519KeyPair {
	public, private, err := ed25519.GenerateKey(nil)
	if err != nil {
		panic(err)
	}
	return Ed25519KeyPair{id: uuid.New(), public: public, private: private}
}

func (k Ed25519KeyPair) Kind() types.VerificationKeyKind {
	return types.VerificationKeyKindEd25519
}

func (k Ed25519KeyPair) Id() uuid.UUID {
	return k.id
}

func (k Ed25519KeyPair) Public() ed25519.PublicKey {
	return k.public
}

func (k Ed25519KeyPair) PublicBase64() string {
	return base64.StdEncoding.EncodeToString(k.public)
}

func (k Ed25519KeyPair) Private() ed25519.PrivateKey {
	return k.private
}

type TokenWithValue struct {
	types.Token
	Value string
}
