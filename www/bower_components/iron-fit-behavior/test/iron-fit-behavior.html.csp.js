function makeScrolling(el) {
        el.classList.add('scrolling');
        var template = document.getElementById('ipsum');
        for (var i = 0; i < 20; i++) {
          el.appendChild(template.content.cloneNode(true));
        }
      }

      function intersects(r1, r2) {
        return !(r2.left >= r1.right || r2.right <= r1.left || r2.top >= r1.bottom || r2.bottom <= r1.top);
      }

      suite('basic', function() {

        var el;
        setup(function() {
          el = fixture('basic');
        });

        test('position() works without autoFitOnAttach', function() {
          el.verticalAlign = 'top';
          el.horizontalAlign = 'left';
          el.position();
          var rect = el.getBoundingClientRect();
          assert.equal(rect.top, 0, 'top ok');
          assert.equal(rect.left, 0, 'left ok');
        });

        test('constrain() works without autoFitOnAttach', function() {
          el.constrain();
          var style = getComputedStyle(el);
          assert.equal(style.maxWidth, window.innerWidth + 'px', 'maxWidth ok');
          assert.equal(style.maxHeight, window.innerHeight + 'px', 'maxHeight ok');
        });

        test('center() works without autoFitOnAttach', function() {
          el.center();
          var rect = el.getBoundingClientRect();
          assert.closeTo(rect.left - (window.innerWidth - rect.right), 0, 5, 'centered horizontally');
          assert.closeTo(rect.top - (window.innerHeight - rect.bottom), 0, 5, 'centered vertically');
        });

      });

      suite('manual positioning', function() {

        test('css positioned element is not re-positioned', function() {
          var el = fixture('positioned-xy');
          var rect = el.getBoundingClientRect();
          assert.equal(rect.top, 100, 'top is unset');
          assert.equal(rect.left, 100, 'left is unset');

        });

        test('inline positioned element is not re-positioned', function() {
          var el = fixture('inline-positioned-xy');
          var rect = el.getBoundingClientRect();
          // need to measure document.body here because mocha sets a min-width on html,body, and
          // the element is positioned wrt to that by css
          var bodyRect = document.body.getBoundingClientRect();
          assert.equal(rect.top, 100, 'top is unset');
          assert.equal(rect.left, 100, 'left is unset');

          el.refit();

          rect = el.getBoundingClientRect();
          assert.equal(rect.top, 100, 'top is unset after refit');
          assert.equal(rect.left, 100, 'left is unset after refit');

        });

        test('position property is preserved after', function() {
          var el = fixture('absolute');
          assert.equal(getComputedStyle(el).position, 'absolute', 'position:absolute is preserved');
        });
      });

      suite('fit to window', function() {

        test('sized element is centered in viewport', function() {
          var el = fixture('sized-xy');
          var rect = el.getBoundingClientRect();
          assert.closeTo(rect.left - (window.innerWidth - rect.right), 0, 5, 'centered horizontally');
          assert.closeTo(rect.top - (window.innerHeight - rect.bottom), 0, 5, 'centered vertically');
        });

        test('sized element with margin is centered in viewport', function() {
          var el = fixture('sized-xy');
          el.classList.add('with-margin');
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.closeTo(rect.left - (window.innerWidth - rect.right), 0, 5, 'centered horizontally');
          assert.closeTo(rect.top - (window.innerHeight - rect.bottom), 0, 5, 'centered vertically');
        });

        test('sized element with transformed parent is centered in viewport', function() {
          var constrain = fixture('constrain-target');
          var el = Polymer.dom(constrain).querySelector('.el');
          var rectBefore = el.getBoundingClientRect();
          constrain.style.transform = 'translate3d(5px, 5px, 0)';
          el.center();
          var rectAfter = el.getBoundingClientRect();
          assert.equal(rectBefore.top, rectAfter.top, 'top ok');
          assert.equal(rectBefore.bottom, rectAfter.bottom, 'bottom ok');
          assert.equal(rectBefore.left, rectAfter.left, 'left ok');
          assert.equal(rectBefore.right, rectAfter.right, 'right ok');
        });

        test('scrolling element is centered in viewport', function() {
          var el = fixture('sized-x');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.closeTo(rect.left - (window.innerWidth - rect.right), 0, 5, 'centered horizontally');
          assert.closeTo(rect.top - (window.innerHeight - rect.bottom), 0, 5, 'centered vertically');
        });

        test('scrolling element is constrained to viewport height', function() {
          var el = fixture('sized-x');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight, 'height is less than or equal to viewport height');
        });

        test('scrolling element with offscreen container is constrained to viewport height', function() {
          var container = fixture('offscreen-container');
          var el = Polymer.dom(container).querySelector('.el')
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight, 'height is less than or equal to viewport height');
        });

        test('scrolling element with max-height is centered in viewport', function() {
          var el = fixture('sized-x');
          el.classList.add('with-max-height');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.closeTo(rect.left - (window.innerWidth - rect.right), 0, 5, 'centered horizontally');
          assert.closeTo(rect.top - (window.innerHeight - rect.bottom), 0, 5, 'centered vertically');
        });

        test('scrolling element with max-height respects max-height', function() {
          var el = fixture('sized-x');
          el.classList.add('with-max-height');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= 500, 'height is less than or equal to max-height');
        });

        test('css positioned, scrolling element is constrained to viewport height (top,left)', function() {
          var el = fixture('positioned-xy');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight - 100, 'height is less than or equal to viewport height');
        });

        test('css positioned, scrolling element is constrained to viewport height (bottom, right)', function() {
          var el = fixture('sized-x');
          el.classList.add('positioned-bottom');
          el.classList.add('positioned-right');
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight - 100, 'height is less than or equal to viewport height');
        });

        test('sized, scrolling element with margin is centered in viewport', function() {
          var el = fixture('sized-x');
          el.classList.add('with-margin');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.closeTo(rect.left - (window.innerWidth - rect.right), 0, 5, 'centered horizontally');
          assert.closeTo(rect.top - (window.innerHeight - rect.bottom), 0, 5, 'centered vertically');
        });

        test('sized, scrolling element is constrained to viewport height', function() {
          var el = fixture('sized-x');
          el.classList.add('with-margin');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight - 20 * 2, 'height is less than or equal to viewport height');
        });

        test('css positioned, scrolling element with margin is constrained to viewport height (top, left)', function() {
          var el = fixture('positioned-xy');
          el.classList.add('with-margin');
          makeScrolling(el);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight - 100 - 20 * 2, 'height is less than or equal to viewport height');
        });

        test('css positioned, scrolling element with margin is constrained to viewport height (bottom, right)', function() {
          var el = fixture('sized-x');
          el.classList.add('positioned-bottom');
          el.classList.add('positioned-right');
          el.classList.add('with-margin')
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight - 100 - 20 * 2, 'height is less than or equal to viewport height');
        });

        test('scrolling sizingTarget is constrained to viewport height', function() {
          el = fixture('sectioned');
          var internal = Polymer.dom(el).querySelector('.internal');
          el.sizingTarget = internal;
          makeScrolling(internal);
          el.refit();
          var rect = el.getBoundingClientRect();
          assert.isTrue(rect.height <= window.innerHeight, 'height is less than or equal to viewport height');
        });

        test('scrolling sizingTarget preserves scrolling position', function() {
          el = fixture('scrollable');
          el.scrollTop = 20;
          el.scrollLeft = 20;
          el.refit();
          assert.equal(el.scrollTop, 20, 'scrollTop ok');
          assert.equal(el.scrollLeft, 20, 'scrollLeft ok');
        });

      });

      suite('fit to element', function() {

        test('element fits in another element', function() {
          var constrain = fixture('constrain-target');
          var el = Polymer.dom(constrain).querySelector('.el')
          makeScrolling(el);
          el.fitInto = constrain;
          el.refit();
          var rect = el.getBoundingClientRect();
          var crect = constrain.getBoundingClientRect();
          assert.isTrue(rect.height <= crect.height, 'width is less than or equal to fitInto width');
          assert.isTrue(rect.height <= crect.height, 'height is less than or equal to fitInto height');
        });

        test('element centers in another element', function() {
          var constrain = fixture('constrain-target');
          var el = Polymer.dom(constrain).querySelector('.el');
          makeScrolling(el);
          el.fitInto = constrain;
          el.refit();
          var rect = el.getBoundingClientRect();
          var crect = constrain.getBoundingClientRect();
          assert.closeTo(rect.left - crect.left - (crect.right - rect.right), 0, 5, 'centered horizontally in fitInto');
          assert.closeTo(rect.top - crect.top - (crect.bottom - rect.bottom), 0, 5, 'centered vertically in fitInto');
        });

        test('element with max-width centers in another element', function() {
          var constrain = document.querySelector('.constrain');
          var el = fixture('sized-xy');
          el.classList.add('with-max-width');
          el.fitInto = constrain;
          el.refit();
          var rect = el.getBoundingClientRect();
          var crect = constrain.getBoundingClientRect();
          assert.closeTo(rect.left - crect.left - (crect.right - rect.right), 0, 5, 'centered horizontally in fitInto');
          assert.closeTo(rect.top - crect.top - (crect.bottom - rect.bottom), 0, 5, 'centered vertically in fitInto');
        });

      });

      suite('horizontal/vertical align', function() {
        var parent, parentRect;
        var el, elRect;
        var fitRect = {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
          width: window.innerWidth,
          height: window.innerHeight
        };

        setup(function() {
          parent = fixture('constrain-target');
          parentRect = parent.getBoundingClientRect();
          el = Polymer.dom(parent).querySelector('.el');
          elRect = el.getBoundingClientRect();
        });

        test('intersects works', function() {
          var base = {top: 0, bottom: 1, left:0, right: 1};
          assert.isTrue(intersects(base, base), 'intersects itself');
          assert.isFalse(intersects(base, {top:1, bottom: 2, left: 0, right: 1}), 'no intersect on edge');
          assert.isFalse(intersects(base, {top:-2, bottom: -1, left: 0, right: 1}), 'no intersect on edge (negative values)');
          assert.isFalse(intersects(base, {top:2, bottom: 3, left: 0, right: 1}), 'no intersect');
        });

        suite('when verticalAlign is top', function() {
          test('element is aligned to the positionTarget top', function() {
            el.verticalAlign = 'top';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.top, parentRect.top, 'top ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('element is aligned to the positionTarget top without overlapping it', function() {
            // Allow enough space on the parent's bottom & right.
            parent.style.width = '10px';
            parent.style.height = '10px';
            parentRect = parent.getBoundingClientRect();
            el.verticalAlign = 'top';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('element margin is considered as offset', function() {
            el.verticalAlign = 'top';
            el.style.marginTop = '10px';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.top, parentRect.top + 10, 'top ok');
            assert.equal(rect.height, elRect.height, 'no cropping');

            el.style.marginTop = '-10px';
            el.refit();
            rect = el.getBoundingClientRect();
            assert.equal(rect.top, parentRect.top - 10, 'top ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('verticalOffset is applied', function() {
            el.verticalAlign = 'top';
            el.verticalOffset = 10;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.top, parentRect.top + 10, 'top ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('max-height is updated', function() {
            parent.style.top = '-10px';
            el.verticalAlign = 'top';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.top, 0, 'top ok');
            assert.isBelow(rect.height, elRect.height, 'height ok');
          });

          test('min-height is preserved: element is displayed even if partially', function() {
            parent.style.top = '-10px';
            el.verticalAlign = 'top';
            el.style.minHeight = elRect.height + 'px';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.height, elRect.height, 'min-height ok');
            assert.isTrue(intersects(rect, fitRect), 'partially visible');
          });

          test('dynamicAlign will prefer bottom align if it minimizes the cropping', function() {
            parent.style.top = '-10px';
            parentRect = parent.getBoundingClientRect();
            el.verticalAlign = 'top';
            el.dynamicAlign = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.bottom, parentRect.bottom, 'bottom ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });
        });

        suite('when verticalAlign is bottom', function() {
          test('element is aligned to the positionTarget bottom', function() {
            el.verticalAlign = 'bottom';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.bottom, parentRect.bottom, 'bottom ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('element is aligned to the positionTarget bottom without overlapping it', function() {
            el.verticalAlign = 'bottom';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('element margin is considered as offset', function() {
            el.verticalAlign = 'bottom';
            el.style.marginBottom = '10px';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.bottom, parentRect.bottom - 10, 'bottom ok');
            assert.equal(rect.height, elRect.height, 'no cropping');

            el.style.marginBottom = '-10px';
            el.refit();
            rect = el.getBoundingClientRect();
            assert.equal(rect.bottom, parentRect.bottom + 10, 'bottom ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('verticalOffset is applied', function() {
            el.verticalAlign = 'bottom';
            el.verticalOffset = 10;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.bottom, parentRect.bottom - 10, 'bottom ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('element max-height is updated', function() {
            parent.style.top = (100 - parentRect.height) + 'px';
            el.verticalAlign = 'bottom';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.bottom, 100, 'bottom ok');
            assert.equal(rect.height, 100, 'height ok');
          });

          test('min-height is preserved: element is displayed even if partially', function() {
            parent.style.top = (elRect.height - 10 - parentRect.height) + 'px';
            el.verticalAlign = 'bottom';
            el.style.minHeight = elRect.height + 'px';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.height, elRect.height, 'min-height ok');
            assert.isTrue(intersects(rect, fitRect), 'partially visible');
          });

          test('dynamicAlign will prefer top align if it minimizes the cropping', function() {
            parent.style.top = (window.innerHeight - elRect.height) + 'px';
            parentRect = parent.getBoundingClientRect();
            el.verticalAlign = 'bottom';
            el.dynamicAlign = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.top, parentRect.top, 'top ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });
        });

        suite('when verticalAlign is auto', function() {
          test('element is aligned to the positionTarget top', function() {
            el.verticalAlign = 'auto';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.top, parentRect.top, 'auto aligned to top');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('element is aligned to the positionTarget top without overlapping it', function() {
            // Allow enough space on the parent's bottom & right.
            parent.style.width = '10px';
            parent.style.height = '10px';
            parentRect = parent.getBoundingClientRect();
            el.verticalAlign = 'auto';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.height, elRect.height, 'no cropping');
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
          });

          test('bottom is preferred to top if it diminishes the cropped area', function() {
            // This would cause a cropping of the element, so it should automatically
            // align to the bottom to avoid it.
            parent.style.top = '-10px';
            parentRect = parent.getBoundingClientRect();
            el.verticalAlign = 'auto';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.bottom, parentRect.bottom, 'auto aligned to bottom');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

          test('bottom is preferred to top if it diminishes the cropped area, without overlapping positionTarget', function() {
            // This would cause a cropping of the element, so it should automatically
            // align to the bottom to avoid it.
            parent.style.top = '-10px';
            parentRect = parent.getBoundingClientRect();
            el.verticalAlign = 'auto';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.height, elRect.height, 'no cropping');
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
          });
        });

        suite('when horizontalAlign is left', function() {
          test('element is aligned to the positionTarget left', function() {
            el.horizontalAlign = 'left';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left, 'left ok');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('element is aligned to the positionTarget left without overlapping it', function() {
            // Make space at the parent's right.
            parent.style.width = '10px';
            parentRect = parent.getBoundingClientRect();
            el.horizontalAlign = 'left';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('element margin is considered as offset', function() {
            el.horizontalAlign = 'left';
            el.style.marginLeft = '10px';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left + 10, 'left ok');
            assert.equal(rect.width, elRect.width, 'no cropping');

            el.style.marginLeft = '-10px';
            el.refit();
            rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left - 10, 'left ok');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('horizontalOffset is applied', function() {
            el.horizontalAlign = 'left';
            el.horizontalOffset = 10;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left + 10, 'left ok');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('element max-width is updated', function() {
            parent.style.left = '-10px';
            el.horizontalAlign = 'left';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, 0, 'left ok');
            assert.isBelow(rect.width, elRect.width, 'width ok');
          });

          test('min-width is preserved: element is displayed even if partially', function() {
            parent.style.left = '-10px';
            el.style.minWidth = elRect.width + 'px';
            el.horizontalAlign = 'left';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.width, elRect.width, 'min-width ok');
            assert.isTrue(intersects(rect, fitRect), 'partially visible');
          });

          test('dynamicAlign will prefer right align if it minimizes the cropping', function() {
            parent.style.left = '-10px';
            parentRect = parent.getBoundingClientRect();
            el.horizontalAlign = 'left';
            el.dynamicAlign = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right, 'right ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

        });

        suite('when horizontalAlign is right', function() {
          test('element is aligned to the positionTarget right', function() {
            el.horizontalAlign = 'right';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right, 'right ok');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('element is aligned to the positionTarget right without overlapping it', function() {
            // Make space at the parent's left.
            parent.style.left = elRect.width + 'px';
            parentRect = parent.getBoundingClientRect();
            el.horizontalAlign = 'right';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('element margin is considered as offset', function() {
            el.horizontalAlign = 'right';
            el.style.marginRight = '10px';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right - 10, 'right ok');
            assert.equal(rect.width, elRect.width, 'no cropping');

            el.style.marginRight = '-10px';
            el.refit();
            rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right + 10, 'right ok');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('horizontalOffset is applied', function() {
            el.horizontalAlign = 'right';
            el.horizontalOffset = 10;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right - 10, 'right ok');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('element max-width is updated', function() {
            parent.style.left = (100 - parentRect.width) + 'px';
            el.horizontalAlign = 'right';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, 100, 'right ok');
            assert.equal(rect.width, 100, 'width ok');
          });

          test('min-width is preserved: element is displayed even if partially', function() {
            parent.style.left = (elRect.width - 10 - parentRect.width) + 'px';
            el.horizontalAlign = 'right';
            el.style.minWidth = elRect.width + 'px';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.width, elRect.width, 'min-width ok');
            assert.isTrue(intersects(rect, fitRect), 'partially visible');
          });

          test('dynamicAlign will prefer left align if it minimizes the cropping', function() {
            parent.style.left = (window.innerWidth - elRect.width) + 'px';
            parentRect = parent.getBoundingClientRect();
            el.horizontalAlign = 'right';
            el.dynamicAlign = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left, 'left ok');
            assert.equal(rect.height, elRect.height, 'no cropping');
          });

        });

        suite('when horizontalAlign is auto', function() {
          test('element is aligned to the positionTarget left', function() {
            el.horizontalAlign = 'auto';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left, 'auto aligned to left');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('element is aligned to the positionTarget left without overlapping positionTarget', function() {
            // Make space at the parent's left.
            parent.style.left = elRect.width + 'px';
            parentRect = parent.getBoundingClientRect();
            el.horizontalAlign = 'auto';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.width, elRect.width, 'no cropping');
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
          });

          test('right is preferred to left if it diminishes the cropped area', function() {
            // This would cause a cropping of the element, so it should automatically
            // align to the right to avoid it.
            parent.style.left = '-10px';
            parentRect = parent.getBoundingClientRect();
            el.horizontalAlign = 'auto';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right, 'auto aligned to right');
            assert.equal(rect.width, elRect.width, 'no cropping');
          });

          test('right is preferred to left if it diminishes the cropped area, without overlapping positionTarget', function() {
            // Make space at the parent's right.
            parent.style.width = '10px';
            parentRect = parent.getBoundingClientRect();
            el.horizontalAlign = 'auto';
            el.noOverlap = true;
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.width, elRect.width, 'no cropping');
            assert.isFalse(intersects(rect, parentRect), 'no overlap');
          });
        });

        suite('prefer horizontal overlap to vertical overlap', function() {
          setup(function() {
            el.noOverlap = true;
            el.dynamicAlign = true;
            // Make space around the positionTarget.
            parent.style.top = elRect.height + 'px';
            parent.style.left = elRect.width + 'px';
            parent.style.width = '10px';
            parent.style.height = '10px';
            parentRect = parent.getBoundingClientRect();
          });

          test('top-left aligns to target bottom-left', function() {
            el.verticalAlign = 'top';
            el.horizontalAlign = 'left';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left, 'left ok');
            assert.equal(rect.top, parentRect.bottom, 'top ok');
          });

          test('top-right aligns to target bottom-right', function() {
            el.verticalAlign = 'top';
            el.horizontalAlign = 'right';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right, 'right ok');
            assert.equal(rect.top, parentRect.bottom, 'top ok');
          });

          test('bottom-left aligns to target top-left', function() {
            el.verticalAlign = 'bottom';
            el.horizontalAlign = 'left';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.left, parentRect.left, 'left ok');
            assert.equal(rect.bottom, parentRect.top, 'bottom ok');
          });

          test('bottom-right aligns to target top-right', function() {
            el.verticalAlign = 'bottom';
            el.horizontalAlign = 'right';
            el.refit();
            var rect = el.getBoundingClientRect();
            assert.equal(rect.right, parentRect.right, 'right ok');
            assert.equal(rect.bottom, parentRect.top, 'bottom ok');
          });

        });

      });