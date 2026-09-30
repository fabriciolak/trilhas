FROM python:3.14-alpine
WORKDIR /app
COPY app/frete.py .
USER nobody
CMD ["python", "-c", "from frete import calcular_frete; print(calcular_frete(2, 'sudeste'))"]
