# Treino de AWS: sobe a AWS simulada (Moto) do zero, vazia.
import time

rede_nuvem()
docker("rm", "-f", "gym-moto")
docker("run", "-d", "--name", "gym-moto", "--network", "gym-nuvem", "--network-alias", "moto",
       "-p", "15000:5000", "-e", "MOTO_IAM_LOAD_MANAGED_POLICIES=true", "motoserver/moto:5.2.3")
for _ in range(60):
    if http("http://localhost:15000/moto-api/")[0] == 200:
        break
    time.sleep(1)
