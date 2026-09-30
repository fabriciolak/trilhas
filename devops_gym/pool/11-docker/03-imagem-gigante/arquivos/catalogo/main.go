// catalogo: o serviço de catálogo da Pinguim Store (simulado para o DevOps Gym).
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type produto struct {
	ID    int     `json:"id"`
	Nome  string  `json:"nome"`
	Preco float64 `json:"preco"`
}

var produtos = []produto{
	{1, "Caneca Tux", 39.90},
	{2, "Camiseta Pinguim", 79.90},
	{3, "Pelúcia de pinguim", 59.90},
}

func responder(w http.ResponseWriter, dado any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(dado)
}

func main() {
	porta := os.Getenv("PORTA")
	if porta == "" {
		porta = "8080"
	}
	http.HandleFunc("/saude", func(w http.ResponseWriter, r *http.Request) {
		responder(w, map[string]string{"status": "ok", "servico": "catalogo"})
	})
	http.HandleFunc("/produtos", func(w http.ResponseWriter, r *http.Request) {
		responder(w, produtos)
	})
	log.Printf("catalogo ouvindo na porta %s", porta)
	log.Fatal(http.ListenAndServe(":"+porta, nil))
}
