suite('selection', function() {
      var list, container;

      setup(function() {
        container = fixture('trivialList');
        list = container.list;
      });

      test('single selection by item index', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          assert.isNull(list.selectedItem);

          list.selectItem(0);

          assert.deepEqual(list.selectedItem, list.items[0]);

          list.deselectItem(0);

          assert.deepEqual(list.selectedItem, null);

          list.selectItem(99);

          assert.deepEqual(list.selectedItem, list.items[99]);

          done();
        });
      });

      test('single selection by item object', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          assert.isNull(list.selectedItem);

          list.selectItem(list.items[50]);

          assert.deepEqual(list.selectedItem, list.items[50]);

          done();
        });
      });

      test('multi selection by item index', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.multiSelection = true;

          assert.isArray(list.selectedItems);

          list.selectItem(0);
          list.selectItem(50);
          list.selectItem(99);

          assert.equal(list.selectedItems.length, 3);
          assert.notEqual(list.selectedItems.indexOf(list.items[0]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[50]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[99]), -1);
          assert.equal(list.selectedItems.indexOf(list.items[2]), -1);

          done();
        });
      });

      test('multi selection by item object', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.multiSelection = true;

          assert.isArray(list.selectedItems);

          list.selectItem(list.items[0]);
          list.selectItem(list.items[50]);
          list.selectItem(list.items[99]);

          assert.equal(list.selectedItems.length, 3);
          assert.notEqual(list.selectedItems.indexOf(list.items[0]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[50]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[99]), -1);
          assert.equal(list.selectedItems.indexOf(list.items[2]), -1);

          done();
        });
      });

      test('clear selection', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.multiSelection = true;

          assert.isArray(list.selectedItems);

          list.items.forEach(function(item) {
             list.selectItem(item);
          });

          assert.equal(list.selectedItems.length, list.items.length);

          list.clearSelection();

          assert.equal(list.selectedItems.length, 0);

          done();
        });
      });


      test('toggle selection by item index', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.toggleSelectionForItem(0);

          assert.deepEqual(list.selectedItem, list.items[0]);

          list.toggleSelectionForItem(0);

          assert.isNull(list.selectedItem);

          done();
        });
      });

      test('toggle selection by item object', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.toggleSelectionForItem(list.items[0]);

          assert.deepEqual(list.selectedItem, list.items[0]);

          list.toggleSelectionForItem(list.items[0]);

          assert.isNull(list.selectedItem);

          done();
        });
      });

      test('change multi property', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.multiSelection = true;

          assert.isArray(list.selectedItems);

          list.multiSelection = false;

          assert.isNotArray(list.selectedItems);
          assert.isNull(list.selectedItems);

          list.multiSelection = true;

          assert.isArray(list.selectedItems);

          done();
        });
      });

      test('selectionEnabled with single selection', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.selectionEnabled = true;

          assert.isNull(list.selectedItem);

          // select item[0]
          MockInteractions.tap(list._physicalItems[0]);

          assert.deepEqual(list.selectedItem, list.items[0]);

          // select item[5] and deselect item[0]
          MockInteractions.tap(list._physicalItems[5]);

          // select item[1] and deselect item[5]
          MockInteractions.tap(list._physicalItems[1]);

          assert.deepEqual(list.selectedItem, list.items[1]);

          done();
        });
      });

      test('selectionEnabled with multiple selection', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          list.multiSelection = true;

          MockInteractions.tap(list._physicalItems[0]);
          assert.equal(list.selectedItems.length, 0);

          // enable the feature
          list.selectionEnabled = true;

          // select item[0]
          MockInteractions.tap(list._physicalItems[0]);

          assert.notEqual(list.selectedItems.indexOf(list.items[0]), -1);

          // multiple selection
          MockInteractions.tap(list._physicalItems[1]);
          MockInteractions.tap(list._physicalItems[5]);
          MockInteractions.tap(list._physicalItems[10]);
          MockInteractions.tap(list._physicalItems[12]);

          list.selectItem(0);
          list.deselectItem(1);

          assert.equal(list.selectedItems.indexOf(list.items[1]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[0]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[5]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[10]), -1);
          assert.notEqual(list.selectedItems.indexOf(list.items[12]), -1);

          list.clearSelection();

          assert.equal(list.selectedItems.length, 0);

          // disable the feature
          list.selectionEnabled = false;

          MockInteractions.tap(list._physicalItems[1]);

          assert.equal(list.selectedItems.length, 0);

          done();
        });
      });

    test('toggle', function(done) {
      list.items = buildDataSet(100);

      flush(function() {
        list.selectionEnabled = true;

        MockInteractions.tap(list._physicalItems[0]);

        assert.deepEqual(list.selectedItem, list.items[0]);

        MockInteractions.tap(list._physicalItems[0]);

        assert.isNull(list.selectedItem);

        MockInteractions.tap(list._physicalItems[0]);
        list.clearSelection();

        assert.isNull(list.selectedItem);

        done();
      });

    });

     test('selectedAs', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          // multi selection
          list.multiSelection = true;

          assert.isFalse(list._physicalItems[0]._templateInstance.selected);

          list.selectItem(0);

          assert.isTrue(list._physicalItems[0]._templateInstance.selected);

          list.toggleSelectionForItem(0);

          assert.isFalse(list._physicalItems[0]._templateInstance.selected);

          // single selection
          list.multiSelection = false;

          list.selectItem(0);
          list.selectItem(10);

          assert.isFalse(list._physicalItems[0]._templateInstance.selected);
          assert.isTrue(list._physicalItems[10]._templateInstance.selected);

          done();
        });
      });

      test('splice a selected item', function(done) {
        list.items = buildDataSet(100);

        flush(function() {
          // multi selection
          list.multiSelection = true;

          // select the first two items
          list.selectItem(0);
          list.selectItem(1);

          assert.equal(list.selectedItems.length, 2);

          // remove the first two items
          list.splice('items', 0, 2);

          assert.equal(list.selectedItems.length, 0);

          done();
        });
      });

      test('single selection of a primitive type', function() {
        list.primitive = true;
        list.items = ['a', 'b', 'c', 'd'];
        list.selectionEnabled = true;
        Polymer.dom.flush();
        list.selectItem(0);
        assert.equal(list.selectedItem, 'a', 'single selection 1');
        list.clearSelection();
        assert.isNull(list.selectedItem);
        list.selectItem(2);
        list.set('items.0', 'z');
        list.set('items.1', 'y');
        assert.equal(list.selectedItem, 'c', 'single selection 2');
      });

      test('multi selection of a primitive types', function() {
        list.primitive = true;
        list.items = ['a', 'b', 'c', 'd'];
        list.selectionEnabled = true;
        list.multiSelection = true;
        Polymer.dom.flush();
        list.selectItem(0);
        list.selectItem(1);
        assert.deepEqual(list.selectedItems, ['a', 'b'], 'multiple selection 1');
        list.clearSelection();
        assert.equal(list.selectedItems.length, 0, 'multiple selection 2');
      });

      test('modify primitive item while being selected', function() {
        list.primitive = true;
        list.items = ['a', 'b', 'c', 'd'];
        list.selectionEnabled = true;
        Polymer.dom.flush();
        list.selectItem(0);
        list.set('items.0', 'z');
        assert.equal(list.selectedItem, 'z', 'single selection 1');
        list.selectItem(2);
        assert.equal(list.selectedItem, 'c', 'single selection 2');
        list.clearSelection();
        assert.isNull(list.selectedItem);

        // test multi selection
        list.multiSelection = true;
        list.selectItem(0);
        list.selectItem(1);
        assert.deepEqual(list.selectedItems, ['z', 'b'], 'multiple selection 1');
        list.set('items.1', 'y');
        assert.deepEqual(list.selectedItems, ['z', 'y'], 'multiple selection 2');
        list.deselectItem('y');
        assert.deepEqual(list.selectedItems, ['z'], 'multiple selection 3');
        list.deselectItem('z');
        assert.equal(list.selectedItems.length, 0);
      });

      test('tapping on a focusable child should not change the selection', function() {
        list.items = buildDataSet(1);
        list.selectionEnabled = true;
        Polymer.dom.flush();
        var node = document.createElement('div');
        node.innerText = 'focusable';
        node.tabIndex = 0;
        Polymer.dom(getFirstItemFromList(list)).appendChild(node);
        Polymer.dom.flush();
        node.focus();
        MockInteractions.tap(node);
        assert.isNull(list.selectedItem);
      });
    });