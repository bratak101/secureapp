package email

import (
	"fmt"
	"log"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

// SendPasswordReset wysyła kod resetu hasła na e-mail.
func SendPasswordReset(toEmail, code string) error {
	apiKey := os.Getenv("SENDGRID_API_KEY")
	fromAddr := os.Getenv("MAIL_FROM")
	if fromAddr == "" {
		fromAddr = "noreply@example.com"
	}
	appName := os.Getenv("MAIL_APP_NAME")
	if appName == "" {
		appName = "Secure App"
	}

	if apiKey == "" {
		log.Printf("[EMAIL] SENDGRID_API_KEY nie ustawiony – kod resetu dla %s: %s", toEmail, code)
		return nil
	}

	from := mail.NewEmail(appName, fromAddr)
	to := mail.NewEmail("", toEmail)
	subject := fmt.Sprintf("[%s] Reset hasła", appName)
	plainBody := fmt.Sprintf("Twój kod do zresetowania hasła: %s\n\nKod jest ważny 15 minut.\n\n— %s", code, appName)
	message := mail.NewSingleEmail(from, subject, to, plainBody, "")
	client := sendgrid.NewSendClient(apiKey)
	resp, err := client.Send(message)
	if err != nil {
		return err
	}
	if resp.StatusCode >= 400 {
		return fmt.Errorf("sendgrid: %d %s", resp.StatusCode, resp.Body)
	}
	return nil
}
