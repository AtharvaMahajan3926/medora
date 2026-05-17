import re

def resolve_user_dashboard():
    with open('frontend/src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Conflict 1: Buttons
    pattern1 = re.compile(r'<<<<<<< HEAD\n\s*<div style={{ display: \'flex\', gap: \'0\.5rem\', marginBottom: \'1rem\' }}>\n\s*<button.*?onClick=\{\(\) => handleOrderNow\(pin\)\}>🛒 Order Now</button>\n\s*<button.*?onClick=\{\(\) => handleDirections\(pin\.pharmacy\)\}>🗺️ Direction</button>\n\s*<a href=\{	el:\$\{pin\.pharmacy\.phone\}\}.*?>📞 Call</a>\n\s*</div>\n=======\n(.*?)\n>>>>>>> [a-f0-9]+', re.DOTALL)
    
    def repl1(m):
        remote_buttons = m.group(1)
        # We inject the Order Now button into the remote buttons
        # The remote buttons look like:
        # <div ...>
        #   <motion.button ... onClick={() => openBookingSetup(pin)}>🛒 Book</motion.button>
        #   ...
        order_now = '                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-sm" onClick={() => handleOrderNow(pin)}>🛒 Order Now</motion.button>'
        
        # insert it after the <div ...>
        lines = remote_buttons.split('\n')
        # find the div
        div_idx = -1
        for i, l in enumerate(lines):
            if '<div' in l:
                div_idx = i
                break
                
        if div_idx != -1:
            lines.insert(div_idx + 1, order_now)
            
        return '\n'.join(lines)

    content = pattern1.sub(repl1, content)
    
    # Conflict 2: The rest of the page (Booking history and modal)
    # The conflict is empty on HEAD.
    pattern2 = re.compile(r'<<<<<<< HEAD\n=======\n(.*?)\n>>>>>>> [a-f0-9]+', re.DOTALL)
    
    def repl2(m):
        return m.group(1)
        
    content = pattern2.sub(repl2, content)
    
    with open('frontend/src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

resolve_user_dashboard()
print('Resolved UserDashboard')
