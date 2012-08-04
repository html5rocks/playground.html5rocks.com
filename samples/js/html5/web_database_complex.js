var db = openDatabase("RecordTest", "1.0", "Google Chrome HTML5 Web SQL Database API", 200000);

function renderRecords(result) {
  for (var i = 0; i < result.rows.length; i++) {
    var row = result.rows.item(i);
    var record = new Record();
    record.id = row['id'];
    record.text = row['text'];
  }
}

// insert initial content
document.getElementById('content').innerHTML = '<ul id="datalist"></ul>'+
                                               '<button id="new_line">Add new record</button>'+
                                               '<button id="delete_table">Delete Table</button>';

// 'add' listener
document.getElementById('new_line').addEventListener('click', function() {
  var newRecord = new Record()
  newRecord.saveRecord.call(newRecord);
});

// 'drop' table listener
document.getElementById('delete_table').addEventListener('click', function() {
  db.transaction(function(tx) {
    alert('drop')
    // tx.executeSql("DROP TABLE PlaygroundRecords");
    // tx.executeSql("DROP DATABASE RecordTest");
    // tx.executeSql("DROP TABLE WebKitStickyNotes");
    // tx.executeSql("DROP DATABASE NoteTest");
    tx.executeSql("INSERT INTO PlaygroundRecords (id, text) VALUES (?, ?)", [123, 'que tal'], null, function(tx, error) {console.log(error)});
  });
});
                  
var Record = function() {
  var self = this;
  var li = document.createElement('li');
  var dumbText = '[Edit this text]';
  li.innerHTML = '<span contenteditable="true">'+ dumbText+'</span>'+
                 ' - <a href="#">Delete</a>';
  
  // 'delete' listener               
  li.querySelector('a').addEventListener('click', function(e) {
    e.preventDefault();
    self.deleteRecord();
  });

  // 'edit' listener
  li.querySelector('span').addEventListener('keyup', function(e) {
    if (self.saveTimeout) clearTimeout(self.saveTimeout);
    self.saveTimeout = setTimeout(function() {
      self.editRecord();
    }, 1500)
  });

  document.getElementById('datalist').appendChild(li);
  this.id = Math.round(Math.random() * 1000);
  this.text = dumbText;
};

Record.prototype = {
  deleteRecord: function() {
    alert('delete')
    db.transaction(function (tx) {
      tx.executeSql("DELETE FROM PlaygroundRecords WHERE id = ?", [this.id]);
    });
  },
  saveRecord: function() {
    alert('save')
    console.log(typeof this.id);
    console.log(typeof this.text)
    console.log('dddddddd')
    db.transaction(function (tx) {
      tx.executeSql("INSERT INTO PlaygroundRecords (id, text) VALUES (?, ?)", [123, 'hola mussol'], null, function(tx, error) {console.log(error)});
    });
  },
  editRecord: function() {
    alert('edit')
    db.transaction(function (tx) {
      tx.executeSql("UPDATE PlaygroundRecords SET text = ? WHERE id = ?", [this.text, this.id], null, function(tx, error) {console.log(error)});
    });
  },
  get text() {
    return this.innerText;
  },
  set text(txt) {
    alert('set text')
    this.innerText = txt;
  }
}

addEventListener('load', function() {
  db.transaction(function(tx) {
    alert('in')
    tx.executeSql("SELECT COUNT(*) FROM PlaygroundRecords", [],
      function(result) {
        alert('padding')
        // renderRecords(result);
      }, 
      function(tx, error) {
        tx.executeSql("CREATE TABLE PlaygroundRecords (id REAL UNIQUE, text TEXT)", [], 
        function(result) {
          alert('create');
          // renderRecords(result);
        },function(tx, error) {console.log(error)});
      }
    );
  });
  
}, false);