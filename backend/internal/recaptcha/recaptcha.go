package recaptcha

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const verifyURL = "https://www.google.com/recaptcha/api/siteverify"

type verifyResponse struct {
	Success bool     `json:"success"`
	ErrorCodes []string `json:"error-codes,omitempty"`
}

// Verify sprawdza token u Google. Gdy RECAPTCHA_SECRET_KEY nie jest ustawiony, zwraca true (pomijamy lokalnie).
func Verify(token, remoteIP string) bool {
	secret := os.Getenv("RECAPTCHA_SECRET_KEY")
	if secret == "" {
		return true
	}
	token = strings.TrimSpace(token)
	if token == "" {
		return false
	}
	form := url.Values{}
	form.Set("secret", secret)
	form.Set("response", token)
	if remoteIP != "" {
		form.Set("remoteip", remoteIP)
	}
	req, err := http.NewRequest(http.MethodPost, verifyURL, strings.NewReader(form.Encode()))
	if err != nil {
		return false
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	var out verifyResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return false
	}
	return out.Success
}
