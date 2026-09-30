d=$CASA/treinos/systemd
u=saudacao
checar "1. a unit existe e roda como nobody" "/etc/systemd/system/saudacao.service com User=nobody" \
  sh -c "test \"\$(systemctl show -p User --value $u)\" = nobody && systemctl show -p ExecStart --value $u | grep -q saudacao.py"
checar "2. o serviço está ativo e responde na 8900" "sudo systemctl start saudacao; curl localhost:8900" \
  sh -c "systemctl is-active --quiet $u && curl -sf --max-time 3 http://localhost:8900/ >/dev/null"
checar "3. sobe no boot" "sudo systemctl enable saudacao" systemctl is-enabled --quiet $u
checar "4. responde 'Bom dia, plantão!'" "Environment=\"MENSAGEM=Bom dia, plantão!\"; daemon-reload e restart" \
  sh -c "curl -s --max-time 3 http://localhost:8900/ | grep -qx 'Bom dia, plantão!'"
pid=$(systemctl show -p MainPID --value $u 2>/dev/null)
if [ "${pid:-0}" -gt 0 ]; then
  kill -9 "$pid"; sleep 4
  novo=$(systemctl show -p MainPID --value $u)
  if systemctl is-active --quiet $u && [ "${novo:-0}" -gt 0 ] && [ "$novo" != "$pid" ]; then ok "5. voltou sozinho depois de um kill -9"
  else falha "5. voltou sozinho depois de um kill -9" "Restart=on-failure na seção [Service]"; fi
else
  falha "5. voltou sozinho depois de um kill -9" "primeiro o serviço precisa estar rodando"
fi
checar "6. log.txt tem o log do serviço" "sudo journalctl -u saudacao -n 20 --no-pager > log.txt (sem sudo você não vê o log do sistema)" grep -q 'saudacao' "$d/log.txt"
checar "7. falhas.txt tem a lista de units que falharam" "systemctl --failed > falhas.txt" grep -qiE 'failed|UNIT|loaded units' "$d/falhas.txt"
