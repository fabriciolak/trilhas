FROM python:3.14-alpine
WORKDIR /app
COPY app/ .
USER nobody
CMD ["python", "-m", "unittest", "-v"]
