package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
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

// GenerateVerificationCode zwraca 6-cyfrowy kod.
func GenerateVerificationCode() (string, error) {
	b := make([]byte, 3)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	n := uint32(b[0])<<16 | uint32(b[1])<<8 | uint32(b[2])
	return fmt.Sprintf("%06d", n%1000000), nil
}
