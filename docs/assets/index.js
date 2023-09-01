const version = "2.11.0";

var sphereAnimation = (function() {
  var sphereEl = document.querySelector('.sphere-animation');
  var spherePathEls = sphereEl.querySelectorAll('.sphere path');
  var pathLength = spherePathEls.length;
  var hasStarted = false;
  var aimations = [];

  var breathAnimation = anime({
    begin: function() {
      for (var i = 0; i < pathLength; i++) {
        // Every other one
        if (i % 2) {
          aimations.push(anime({
            targets: spherePathEls[i],
            stroke: {value: ['#F25E92', 'rgba(80,80,80,.35)'], duration: 400},
            translateX: [2, -4],
            translateY: [2, -4],
            easing: 'easeOutQuad',
            autoplay: false
          }));
        }
        else {
          aimations.push(anime({
            targets: spherePathEls[i],
            stroke: {value: ['#3267FF', 'rgba(80,80,80,.35)'], duration: 400},
            translateX: [2, -4],
            translateY: [2, -4],
            easing: 'easeOutQuad',
            autoplay: false
          }));
        }
      }
    },
    update: function(ins) {
      aimations.forEach(function(animation, i) {
        var percent = (1 - Math.sin((i * .35) + (.0022 * ins.currentTime))) / 2;
        animation.seek(animation.duration * percent);
      });
    },
    duration: Infinity,
    autoplay: false
  });

  var introAnimation = anime.timeline({
    autoplay: false
  })
  .add({
    targets: spherePathEls,
    strokeDashoffset: {
      value: [anime.setDashoffset, 0],
      duration: 3900,
      easing: 'easeInOutCirc',
      delay: anime.stagger(190, {direction: 'reverse'})
    },
    duration: 2000,
    delay: anime.stagger(60, {direction: 'reverse'}),
    easing: 'linear'
  }, 0);

  var shadowAnimation = anime({
      targets: '#sphereGradient',
      x1: '25%',
      x2: '25%',
      y1: '0%',
      y2: '75%',
      duration: 30000,
      easing: 'easeOutQuint',
      autoplay: false
    }, 0);

  function init() {
    introAnimation.play();
    breathAnimation.play();
    shadowAnimation.play();
  }
  
  init();

})();

// On mouse move, translate .centerContainer slightly
const centerContainer = document.querySelector('.centerContainer');
const frontText = document.querySelector('.frontTextH1');
document.addEventListener('mousemove', (e) => {
  centerContainer.style.opacity = 1;
  centerContainer.style.transform = `translateX(${e.clientX / 50}px) translateY(${e.clientY / 50}px)`;
  frontText.style.opacity = 1;
  frontText.style.transform = `translateX(${e.clientX / 50}px) translateY(${e.clientY / 50}px)`;
});

// If phone or tablet, show thing
if (window.innerWidth < 768) {
  centerContainer.style.opacity = 1;
  centerContainer.style.transform = `translateX(0px) translateY(0px)`;
  frontText.style.opacity = 1;
  frontText.style.transform = `translateX(0px) translateY(0px)`;
}

if (navigator.platform.toLowerCase().includes('mac')) {
  try {
    document.getElementById('joinButton3').innerHTML = `<i class="bx bxl-apple"></i> Download (Intel)`;
    document.getElementById('joinButton3').onclick = () => {
      window.open(`https://github.com/parallelsocial/parallel/releases/latest/download/Parallel-${version}.dmg`);
    }
    
    document.getElementById('joinButton4').classList.remove('hidden');
    document.getElementById('joinButton4').innerHTML = `<i class="bx bxl-apple"></i> Download (Apple Silicon)`;
    document.getElementById('joinButton4').onclick = () => {
      window.open(`https://github.com/parallelsocial/parallel/releases/latest/download/Parallel-${version}-arm64.dmg`);
    }
  } catch (error) {
    
  }
}

else if (navigator.platform.toLowerCase().includes('win')) {
  try {
    document.getElementById('joinButton3').innerHTML = `<i class="bx bxl-windows"></i> Download`;
    document.getElementById('joinButton3').onclick = () => {
      window.open(`https://github.com/parallelsocial/parallel/releases/latest/download/Parallel-Setup-${version}.exe`);
    }
    document.getElementById('joinButton4').classList.add('hidden');
  } catch (error) {
    
  }
}

else {
  try {
    document.getElementById('joinButton3').innerHTML = `<i class="bx bxl-github"></i> Download`;
    document.getElementById('joinButton3').onclick = () => {
      window.open(`https://github.com/parallelsocial/parallel/releases/latest/`);
    }
    document.getElementById('joinButton4').classList.add('hidden');
  } catch (error) {
    
  }
}


function musicExpand() {
  document.getElementsByClassName('textLeft')[0].classList.add('textLeftExpanded');
  document.getElementsByClassName('textRight')[0].classList.add('textRightGone');
  document.getElementsByClassName('frontText')[0].classList.add('frontTextGone');
  document.getElementsByClassName('centerContainerContainer')[0].classList.add('centerContainerContainerGone');

  document.getElementById('musicExpandButtonLeft').innerHTML = `<i class="bx bx-minus"></i>`
  document.getElementById('musicExpandButtonLeft').onclick = () => {
    musicCollapse();
  }

  window.setTimeout(() => {
    document.getElementById('musicTextLeft').classList.add('musicTextLeftExpanded');
    document.getElementById('musicContent').classList.remove('hidden')
    document.getElementById('musicContent').classList.remove('fadeOut')
    document.getElementById('musicContent').classList.add('fadeIn')
  }, 500)

  document.getElementById('switchSidesButton').classList.add('switchSidesMusicActive')
  document.getElementById('switchSidesButton').innerHTML = `<i class="bx bx-chevron-right"></i>`
  document.getElementById('switchSidesButton').onclick = () => {
    goRight();
  }

}

function goRight() {
  document.getElementsByClassName('textLeft')[0].classList.remove('textLeftExpanded');
  document.getElementsByClassName('textRight')[0].classList.remove('textRightGone');
  document.getElementsByClassName('frontText')[0].classList.remove('frontTextGone');
  document.getElementsByClassName('centerContainerContainer')[0].classList.remove('centerContainerContainerGone');

  document.getElementById('musicExpandButtonLeft').innerHTML = `<i class="bx bx-plus"></i>`
  document.getElementById('musicExpandButtonLeft').onclick = () => {
    musicExpand();
  }

  document.getElementById('musicTextLeft').classList.remove('musicTextLeftExpanded');
  document.getElementById('musicContent').classList.add('fadeOut')
  document.getElementById('musicContent').classList.remove('fadeIn')
  document.getElementsByClassName('textRight')[0].classList.add('textRightExpanded');
  document.getElementsByClassName('textLeft')[0].classList.add('textLeftGone');
  document.getElementsByClassName('frontText')[0].classList.add('frontTextGoneLeft');
  document.getElementsByClassName('centerContainerContainer')[0].classList.add('centerContainerContainerGoneLeft');

  document.getElementById('socialExpandButtonRight').innerHTML = `<i class="bx bx-minus"></i>`
  document.getElementById('socialExpandButtonRight').onclick = () => {
    socialCollapse();
  }

  window.setTimeout(() => {
    document.getElementById('socialTextRight').classList.add('socialTextRightExpanded');
    document.getElementById('socialContent').classList.remove('hidden')
    document.getElementById('socialContent').classList.remove('fadeOut')
    document.getElementById('socialContent').classList.add('fadeIn')
  }, 500)

  document.getElementById('switchSidesButton').classList.remove('switchSidesMusicActive')
  document.getElementById('switchSidesButton').classList.add('switchSidesSocialActive')
  document.getElementById('switchSidesButton').innerHTML = `<i class="bx bx-chevron-left"></i>`
  document.getElementById('switchSidesButton').onclick = () => {
    goLeft();
  }
}

function goLeft() {
  document.getElementsByClassName('textRight')[0].classList.remove('textRightExpanded');
  document.getElementsByClassName('textLeft')[0].classList.remove('textLeftGone');
  document.getElementsByClassName('frontText')[0].classList.remove('frontTextGoneLeft');
  document.getElementsByClassName('centerContainerContainer')[0].classList.remove('centerContainerContainerGoneLeft');

  document.getElementById('socialExpandButtonRight').innerHTML = `<i class="bx bx-plus"></i>`
  document.getElementById('socialExpandButtonRight').onclick = () => {
    socialExpand();
  }

  document.getElementById('socialTextRight').classList.remove('socialTextRightExpanded');
  document.getElementById('socialContent').classList.add('fadeOut')
  document.getElementById('socialContent').classList.remove('fadeIn')

  document.getElementsByClassName('textLeft')[0].classList.add('textLeftExpanded');
  document.getElementsByClassName('textRight')[0].classList.add('textRightGone');
  document.getElementsByClassName('frontText')[0].classList.add('frontTextGone');
  document.getElementsByClassName('centerContainerContainer')[0].classList.add('centerContainerContainerGone');

  document.getElementById('musicExpandButtonLeft').innerHTML = `<i class="bx bx-minus"></i>`
  document.getElementById('musicExpandButtonLeft').onclick = () => {
    musicCollapse();
  }

  window.setTimeout(() => {
    document.getElementById('musicTextLeft').classList.add('musicTextLeftExpanded');
    document.getElementById('musicContent').classList.remove('hidden')
    document.getElementById('musicContent').classList.remove('fadeOut')
    document.getElementById('musicContent').classList.add('fadeIn')
  }, 500)

  document.getElementById('switchSidesButton').classList.remove('switchSidesSocialActive')
  document.getElementById('switchSidesButton').classList.add('switchSidesMusicActive')
  document.getElementById('switchSidesButton').innerHTML = `<i class="bx bx-chevron-right"></i>`
  document.getElementById('switchSidesButton').onclick = () => {
    goRight();
  }
}

function musicCollapse() {
  document.getElementsByClassName('textLeft')[0].classList.remove('textLeftExpanded');
  document.getElementsByClassName('textRight')[0].classList.remove('textRightGone');
  document.getElementsByClassName('frontText')[0].classList.remove('frontTextGone');
  document.getElementsByClassName('centerContainerContainer')[0].classList.remove('centerContainerContainerGone');

  document.getElementById('musicExpandButtonLeft').innerHTML = `<i class="bx bx-plus"></i>`
  document.getElementById('musicExpandButtonLeft').onclick = () => {
    musicExpand();
  }

  document.getElementById('musicTextLeft').classList.remove('musicTextLeftExpanded');
  document.getElementById('musicContent').classList.add('fadeOut')
  document.getElementById('musicContent').classList.remove('fadeIn')

  document.getElementById('switchSidesButton').classList.remove('switchSidesMusicActive')

}

function socialExpand() {
  document.getElementsByClassName('textRight')[0].classList.add('textRightExpanded');
  document.getElementsByClassName('textLeft')[0].classList.add('textLeftGone');
  document.getElementsByClassName('frontText')[0].classList.add('frontTextGoneLeft');
  document.getElementsByClassName('centerContainerContainer')[0].classList.add('centerContainerContainerGoneLeft');

  document.getElementById('socialExpandButtonRight').innerHTML = `<i class="bx bx-minus"></i>`
  document.getElementById('socialExpandButtonRight').onclick = () => {
    socialCollapse();
  }

  window.setTimeout(() => {
    document.getElementById('socialTextRight').classList.add('socialTextRightExpanded');
    document.getElementById('socialContent').classList.remove('hidden')
    document.getElementById('socialContent').classList.remove('fadeOut')
    document.getElementById('socialContent').classList.add('fadeIn')
  }, 500)

  document.getElementById('switchSidesButton').classList.add('switchSidesSocialActive')
  document.getElementById('switchSidesButton').innerHTML = `<i class="bx bx-chevron-left"></i>`
  document.getElementById('switchSidesButton').onclick = () => {
    goLeft();
  }
}

function socialCollapse() {
  document.getElementsByClassName('textRight')[0].classList.remove('textRightExpanded');
  document.getElementsByClassName('textLeft')[0].classList.remove('textLeftGone');
  document.getElementsByClassName('frontText')[0].classList.remove('frontTextGoneLeft');
  document.getElementsByClassName('centerContainerContainer')[0].classList.remove('centerContainerContainerGoneLeft');

  document.getElementById('socialExpandButtonRight').innerHTML = `<i class="bx bx-plus"></i>`
  document.getElementById('socialExpandButtonRight').onclick = () => {
    socialExpand();
  }

  document.getElementById('socialTextRight').classList.remove('socialTextRightExpanded');
  document.getElementById('socialContent').classList.add('fadeOut')
  document.getElementById('socialContent').classList.remove('fadeIn')

  document.getElementById('switchSidesButton').classList.remove('switchSidesSocialActive')
}

// Scroll gradient thing

window.onscroll = (ev) => {
  let scroll = document.body.scrollTop || document.documentElement.scrollTop;
  let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

  // Adjust #gradientText gradient color as you scroll
  let percent = scroll / height * 100;
  degree = percent * 3.6;
  console.log(degree)
  document.getElementById('gradientText').style = `background: -webkit-linear-gradient(${degree}deg, #13085e, #feb1ff); -webkit-background-clip: text;`;
}
