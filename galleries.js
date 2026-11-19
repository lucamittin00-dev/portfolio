document.querySelectorAll('[data-gallery]').forEach(gallery=>{
  const rail=gallery.querySelector('.gallery-rail');
  const slides=[...rail.querySelectorAll('figure')];
  const counter=gallery.querySelector('.gallery-count');
  const previous=gallery.querySelector('[data-gallery-prev]');
  const next=gallery.querySelector('[data-gallery-next]');
  let current=0;
  function update(){
    const r=rail.getBoundingClientRect();
    let nearest=Infinity;
    slides.forEach((slide,i)=>{const d=Math.abs(slide.getBoundingClientRect().left-r.left);if(d<nearest){nearest=d;current=i;}});
    counter.textContent=`${current+1} / ${slides.length}`;
    previous.disabled=current===0;next.disabled=current===slides.length-1;
  }
  function move(step){
    const target=slides[Math.max(0,Math.min(slides.length-1,current+step))];
    rail.scrollTo({left:target.offsetLeft-slides[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  rail.addEventListener('scroll',update,{passive:true});
  rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}});
  window.addEventListener('resize',update);update();
});
