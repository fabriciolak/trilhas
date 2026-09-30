// Servidor do treino de imagens: responde na porta 8080.
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Olá do Go (uid %d)\n", os.Getuid())
	})
	log.Println("servidor: ouvindo na 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
