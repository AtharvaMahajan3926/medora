import re

def resolve_env():
    with open('backend/.env', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We take the block from a3ffa7b (remote)
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [a-f0-9]+', re.DOTALL)
    
    def repl(m):
        return m.group(2)
        
    new_content = pattern.sub(repl, content)
    with open('backend/.env', 'w', encoding='utf-8') as f:
        f.write(new_content)

def resolve_db():
    with open('backend/database.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [a-f0-9]+', re.DOTALL)
    
    def repl(m):
        return m.group(1) + "\n" + m.group(2)
        
    new_content = pattern.sub(repl, content)
    with open('backend/database.py', 'w', encoding='utf-8') as f:
        f.write(new_content)

def resolve_pkg():
    with open('frontend/package.json', 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [a-f0-9]+', re.DOTALL)
    
    def repl(m):
        return m.group(1) + m.group(2)
        
    new_content = pattern.sub(repl, content)
    with open('frontend/package.json', 'w', encoding='utf-8') as f:
        f.write(new_content)

def resolve_pharmacist():
    with open('frontend/src/pages/PharmacistDashboard.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [a-f0-9]+', re.DOTALL)
    
    def repl(m):
        return "              onClick={() => navigate('/qr-scan')}\n              whileHover={{ x: 5 }}\n              whileTap={{ scale: 0.95 }}\n"
        
    new_content = pattern.sub(repl, content)
    with open('frontend/src/pages/PharmacistDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
        
resolve_env()
resolve_db()
resolve_pkg()
resolve_pharmacist()
print('Resolved simple files')
