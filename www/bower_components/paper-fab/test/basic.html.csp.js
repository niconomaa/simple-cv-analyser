var f1;
    var f2;
    var f3;
    var f4;
    var f5;

    function centerOf(element) {
      var rect = element.getBoundingClientRect();
      return {left: rect.left + rect.width / 2, top: rect.top + rect.height / 2};
    }

    function approxEqual(p1, p2) {
      return Math.round(p1.left) == Math.round(p2.left) && Math.round(p1.top) == Math.round(p2.top);
    }

    function isHidden(element) {
      var rect = element.getBoundingClientRect();
      return (rect.width == 0 && rect.height == 0);
    }

    setup(function() {
      f1 = fixture('TrivialFab').querySelector('#fab1');
      f2 = fixture('SrcFab');
      f3 = fixture('icon-fab');
      f4 = fixture('icon-src-fab');
      f5 = fixture('label-fab');
    });

    test('applies an icon specified by the `icon` attribute', function() {
      assert.isFalse(!!f1.$.icon.usesSrcAttribute);
      assert.ok(Polymer.dom(f1.$.icon.root).querySelector('svg'));
    });

    test('applies an icon specified by the `src` attribute', function() {
      assert.isFalse(f2.$.icon._usesIconset());
      assert.ok(f2.$.icon._img);
    });

    test('renders correctly independent of line height', function() {
      assert.ok(approxEqual(centerOf(f1.$.icon), centerOf(f1)));
    });

    test('fab displays icon with `icon` and `label` attributes', function(done) {
      Polymer.Base.async(function() {
        var icon = f3.$$('iron-icon');
        var text = f3.$$('span');
        expect(icon).not.to.be.null;
        assert.isFalse(isHidden(icon));
        assert.isTrue(isHidden(text));
        expect(icon.icon).to.be.equal(f3.icon);
        expect(f3.getAttribute('aria-label')).to.be.equal(f3.label);
        done();
      });
    });

    test('fab displays icon with `src` and `label` attributes', function(done) {
      Polymer.Base.async(function() {
        var icon = f4.$$('iron-icon');
        var text = f4.$$('span');
        expect(icon).not.to.be.null;
        assert.isFalse(isHidden(icon));
        assert.isTrue(isHidden(text));
        expect(icon.src).to.be.equal(f4.src);
        expect(f4.getAttribute('aria-label')).to.be.equal(f4.label);
        done();
      });
    });

    test('fab displays label with `label` attribute correctly', function(done) {
      Polymer.Base.async(function() {
        var icon = f5.$$('iron-icon');
        var text = f5.$$('span');
        expect(text).not.to.be.null;
        assert.isTrue(isHidden(icon));
        assert.isFalse(isHidden(text));
        expect(text.innerHTML).to.be.equal(f5.label);
        expect(f5.getAttribute('aria-label')).to.be.equal(f5.label);
        done();
      });
    });