package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"
)

type visitor struct {
	count    int
	lastSeen time.Time
}

var (
	rateMu     sync.Mutex
	rateVisits = make(map[string]*visitor)
	rateLimit  = 10
	rateWindow = time.Minute
)

func cleanup() {
	rateMu.Lock()
	defer rateMu.Unlock()
	for ip, v := range rateVisits {
		if time.Since(v.lastSeen) > rateWindow {
			delete(rateVisits, ip)
		}
	}
}

// RateLimit ogranicza liczbę żądań na IP (np. 10/min). Użyj dla /register i /login.
func RateLimit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			if i := strings.Index(xff, ","); i >= 0 {
				ip = strings.TrimSpace(xff[:i])
			} else {
				ip = strings.TrimSpace(xff)
			}
		}
		rateMu.Lock()
		if rateVisits[ip] == nil {
			rateVisits[ip] = &visitor{}
		}
		v := rateVisits[ip]
		if time.Since(v.lastSeen) > rateWindow {
			v.count = 0
			v.lastSeen = time.Now()
		}
		v.count++
		v.lastSeen = time.Now()
		count := v.count
		rateMu.Unlock()
		if count > rateLimit {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error":"Zbyt wiele prob. Sprobuj za chwile."}`))
			return
		}
		if count == 1 {
			go func() {
				time.Sleep(rateWindow)
				cleanup()
			}()
		}
		next(w, r)
	}
}
