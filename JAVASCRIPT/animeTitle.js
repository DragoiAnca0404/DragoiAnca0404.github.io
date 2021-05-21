anime({
    targets: "#textTranslator path",
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutSine',
    duration: 300,
    delay: function(el, i) { return i * 35 },
    direction: 'alternate',
    loop: false
    });