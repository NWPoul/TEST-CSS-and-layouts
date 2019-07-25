function testObserver() {
    console.log('setObserver');

    var options = {
      root: document.getElementById('inner'),
    //   rootMargin: '20% 0% 0% 50%'      
    }
    var callback = function(entries, observer) {
   
      console.log(observer.root);
   
        entries.forEach(entry => {
            var subj = {
            //time : entry.time,               // a DOMHightResTimeStamp indicating when the intersection occurred.
            roorBounds : entry.rootBounds,         // a DOMRectReadOnly for the intersection observer's root.
            bClRect : entry.boundingClientRect, // a DOMRectReadOnly for the intersection observer's target.
            intersectionRext : entry.intersectionRect,   // a DOMRectReadOnly for the visible portion of the intersection observer's target.
            intsRatio : entry.intersectionRatio,  // the number for the ratio of the intersectionRect to the boundingClientRect.
            target : entry.target,             // the Element whose intersection with the intersection root changed.
            isIntersecting : entry.isIntersecting     // intersecting: true or false
            }
            console.log(subj);
        });
    };

    var observer = new IntersectionObserver(callback, options);
    var target = document.getElementById('day2HeaderTh');

    observer.observe(target);
}