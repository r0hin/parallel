const version = "2.7.4";

const footer = `
  <div>
    <b>Parallel</b><br>
    <a class="footerLink" href="https://parallelsocial.net">Home</a>
    <a class="footerLink" href="https://parallelsocial.net/infinite">Infinite</a>
    <a class="footerLink" href="https://parallelsocial.net/support">Support</a>
  </div>
  <div>
    <b>Company</b><br>
    <a class="footerLink" href="https://parallelsocial.net/mission">Mission</a>
    <a class="footerLink" target="_blank" href="https://parallelsocial.net/policies.pdf">Terms of Service</a>
    <a class="footerLink" target="_blank" href="https://parallelsocial.net/policies.pdf">Privacy Policy</a>
    <a class="footerLink" target="_blank" href="https://parallelsocial.net/policies.pdf">Payment Policy</a>
    <a class="footerLink" href="mailto:support@parallelsocial.net">Contact Us</a>
  </div>
  <div>
    <b>Social</b><br>
    <a class="footerLink" target="_blank" href="https://twitter.com/get_on_parallel">Twitter</a>
    <a class="footerLink" target="_blank" href="https://instagram.com/parallelsocial">Instagram</a>
    <a class="footerLink" target="_blank" href="https://parallelsocial.medium.com/">Blog</a>
  </div>
`
document.getElementById('footer').innerHTML = footer;

if (navigator.platform.toLowerCase().includes('mac')) {
  document.getElementById('joinButton1').innerHTML = `<i class="bx bxl-apple"></i> Download (Intel)`;
  document.getElementById('joinButton1').onclick = () => {
    window.open(`https://github.com/r0hin/parallel/releases/latest/download/Parallel-${version}.dmg`);
  }

  document.getElementById('joinButton2').classList.remove('hidden');
  document.getElementById('joinButton2').innerHTML = `<i class="bx bxl-apple"></i> Download (Apple Silicon)`;
  document.getElementById('joinButton2').onclick = () => {
    window.open(`https://github.com/r0hin/parallel/releases/latest/download/Parallel-${version}-arm64.dmg`);
  }

  try {
    document.getElementById('joinButton3').innerHTML = `<i class="bx bxl-apple"></i> Download (Intel)`;
    document.getElementById('joinButton3').onclick = () => {
      window.open(`https://github.com/r0hin/parallel/releases/latest/download/Parallel-${version}.dmg`);
    }
    
    document.getElementById('joinButton4').classList.remove('hidden');
    document.getElementById('joinButton4').innerHTML = `<i class="bx bxl-apple"></i> Download (Apple Silicon)`;
    document.getElementById('joinButton4').onclick = () => {
      window.open(`https://github.com/r0hin/parallel/releases/latest/download/Parallel-${version}-arm64.dmg`);
    }
  } catch (error) {
    
  }
}

else if (navigator.platform.toLowerCase().includes('win')) {
  document.getElementById('joinButton1').innerHTML = `<i class="bx bxl-windows"></i> Download`;
  document.getElementById('joinButton1').onclick = () => {
    window.open(`https://github.com/r0hin/parallel/releases/latest/download/Parallel-Setup-${version}.exe`);
  }

  try {
    document.getElementById('joinButton3').innerHTML = `<i class="bx bxl-windows"></i> Download`;
    document.getElementById('joinButton3').onclick = () => {
      window.open(`https://github.com/r0hin/parallel/releases/latest/download/Parallel-Setup-${version}.exe`);
    }
  } catch (error) {
    
  }
}

else {
  document.getElementById('joinButton1').innerHTML = `<i class="bx bxl-github"></i> Download`;
  document.getElementById('joinButton1').onclick = () => {
    window.open(`https://github.com/r0hin/parallel/releases/latest/`);
  }

  try {
    document.getElementById('joinButton3').innerHTML = `<i class="bx bxl-github"></i> Download`;
    document.getElementById('joinButton3').onclick = () => {
      window.open(`https://github.com/r0hin/parallel/releases/latest/`);
    }
  } catch (error) {
    
  }
}