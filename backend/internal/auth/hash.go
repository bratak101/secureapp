package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
)

const SaltSize = 32

// GenerateSalt tworzy losową sól 32-bajtową (hex = 64 znaki).
func GenerateSalt() (string, error) {
	b := make([]byte, SaltSize)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// HashPassword oblicza nieodwracalny hash: SHA-256(salt + password).
func HashPassword(salt, password string) string {
	h := sha256.New()
	h.Write([]byte(salt))
	h.Write([]byte(password))
	return hex.EncodeToString(h.Sum(nil))
}

// VerifyPassword sprawdza, czy podane hasło zgadza się z zapisanym hashem.
func VerifyPassword(salt, passwordHash, password string) bool {
	expected := HashPassword(salt, password)
	return subtle.ConstantTimeCompare([]byte(expected), []byte(passwordHash)) == 1
}
