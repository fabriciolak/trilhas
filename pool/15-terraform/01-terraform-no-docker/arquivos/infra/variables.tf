variable "porta" {
  description = "Porta do seu computador onde a vitrine vai responder"
  type        = number
  default     = 8484
}

variable "titulo" {
  description = "Título da página da vitrine"
  type        = string
  default     = "Pinguim Store (Terraform)"
}
