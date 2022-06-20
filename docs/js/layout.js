
const footer = `
  <div>
    <b>Parallel</b><br>
    <a class="footerLink" href="https://parallelsocial.net">Home</a>
    <a class="footerLink" href="https://parallelsocial.net/infinite">infinite</a>
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


const elements = document.getElementsByClassName('nativeDownloadButton');

for (let i = 0; i < elements.length; i++) {
  const element = elements[i]
  if (navigator.platform.toLowerCase().includes('mac')) {
    element.innerHTML = `<i class="bx bxl-apple"></i> Download`;
    element.onclick = () => {
      window.open('https://github.com/r0hin/parallel-live/releases/download/v2/Parallel-MacOS.dmg');
    }
  }
  else if (navigator.platform.toLowerCase().includes('win')) {
    element.innerHTML = `<i class="bx bxl-windows"></i> Download`;
    element.onclick = () => {
      window.open('https://github.com/r0hin/parallel-live/releases/download/v2/Parallel-Windows.exe')
    }
  }
  else {
    element.innerHTML = `<i class="bx bxl-github"></i> Download`;
    element.onclick = () => {
      window.open('https://github.com/r0hin/parallel-live/releases');
    }
  }
}