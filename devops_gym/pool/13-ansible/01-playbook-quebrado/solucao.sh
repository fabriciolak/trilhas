# Playbook quebrado: uma solução possível. Um erro de cada vez, sempre lendo a mensagem.
cd ~/ansible

# 1. Sintaxe: "Syntax Error while loading YAML ... did not find expected key", apontando
#    a linha 50: "- name: Instala a unit" tem 3 espaços em vez de 4.
ansible-playbook -i inventario.ini painel.yml --syntax-check || true
sed -i 's/^   - name: Instala a unit do systemd/    - name: Instala a unit do systemd/' painel.yml

# 2. "couldn't resolve module/action 'ansible.builtin.copyy'": erro de digitação.
ansible-playbook -i inventario.ini painel.yml --syntax-check || true
sed -i 's/ansible.builtin.copyy:/ansible.builtin.copy:/' painel.yml

# 3. O erro silencioso: roda, mas "Could not match supplied host pattern, ignoring:
#    servidores" e "skipping: no hosts matched". O inventário chama o grupo de [servidor].
ansible-playbook -i inventario.ini painel.yml || true
ansible-inventory -i inventario.ini --graph
sed -i 's/^  hosts: servidores$/  hosts: servidor/' painel.yml

# 4. "useradd: Permission denied": criar usuário exige root. become: true usa o sudo.
ansible-playbook -i inventario.ini painel.yml || true
sed -i 's/^  become: false$/  become: true/' painel.yml

# 5. "'painel_titulo' is undefined": a variável foi declarada como painel_titlo.
ansible-playbook -i inventario.ini painel.yml || true
sed -i 's/^    painel_titlo:/    painel_titulo:/' painel.yml

# 6. "The requested handler 'Reiniciar painel' was not found": nomes diferem na maiúscula.
ansible-playbook -i inventario.ini painel.yml || true
sed -i 's/^    - name: reiniciar painel$/    - name: Reiniciar painel/' painel.yml

# Agora passa. E a segunda execução não muda nada (changed=0).
ansible-playbook -i inventario.ini painel.yml
ansible-playbook -i inventario.ini painel.yml | tail -n 3
curl -s http://localhost:8090 | grep '<h1>'
systemctl is-active painel; systemctl is-enabled painel
