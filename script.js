document.getElementById("configForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const n = parseInt(document.getElementById("numProcesses").value);
  const m = parseInt(document.getElementById("numResources").value);
  generateTables(n, m);
});

function generateTables(n, m) {
  const allocTable = createMatrix("allocation", n, m);
  const maxTable = createMatrix("max", n, m);
  const avail = createVector("available", m);
  const request = createVector("request", m);  // Add this line

  document.getElementById("allocationTable").innerHTML = allocTable;
  document.getElementById("maxTable").innerHTML = maxTable;
  document.getElementById("availableResources").innerHTML = avail;
  document.getElementById("requestResources").innerHTML = request;  // Add this line
  document.getElementById("matrixInputs").style.display = "block";
}


function createMatrix(name, rows, cols) {
  let html = '<table class="table table-bordered"><tbody>';
  for (let i = 0; i < rows; i++) {
    html += "<tr>";
    for (let j = 0; j < cols; j++) {
      html += `<td><input type="number" id="${name}_${i}_${j}" class="form-control"></td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

function createVector(name, len) {
  let html = '<div class="d-flex gap-2">';
  for (let i = 0; i < len; i++) {
    html += `<input type="number" id="${name}_${i}" class="form-control" style="width: 60px;">`;
  }
  html += "</div>";
  return html;
}

function calculateSafeSequence() {
  const n = parseInt(document.getElementById("numProcesses").value);
  const m = parseInt(document.getElementById("numResources").value);

  const alloc = [], max = [], avail = [];

  for (let i = 0; i < n; i++) {
    alloc[i] = [];
    max[i] = [];
    for (let j = 0; j < m; j++) {
      alloc[i][j] = parseInt(document.getElementById(`allocation_${i}_${j}`).value) || 0;
      max[i][j] = parseInt(document.getElementById(`max_${i}_${j}`).value) || 0;
    }
  }

  for (let j = 0; j < m; j++) {
    avail[j] = parseInt(document.getElementById(`available_${j}`).value) || 0;
  }

  const need = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => max[i][j] - alloc[i][j])
  );

  const finish = Array(n).fill(false);
  const safeSeq = [];

  let count = 0;

  while (count < n) {
    let found = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        let exec = true;
        for (let j = 0; j < m; j++) {
          if (need[i][j] > avail[j]) {
            exec = false;
            break;
          }
        }

        if (exec) {
          for (let k = 0; k < m; k++) avail[k] += alloc[i][k];
          safeSeq.push("P" + i);
          finish[i] = true;
          found = true;
          count++;
        }
      }
    }

    if (!found) break;
  }

  const resultDiv = document.getElementById("result");
  if (safeSeq.length === n) {
    resultDiv.className = "mt-4 alert alert-success";
    resultDiv.innerHTML = `System is in a <strong>Safe State</strong>. Safe sequence: <strong>${safeSeq.join(" → ")}</strong>`;
  } else {
    resultDiv.className = "mt-4 alert alert-danger";
    resultDiv.innerHTML = "System is <strong>Not in a Safe State</strong>!";
  }
  resultDiv.style.display = "block";
}
function handleResourceRequest() {
  const n = parseInt(document.getElementById("numProcesses").value);
  const m = parseInt(document.getElementById("numResources").value);
  const p = parseInt(document.getElementById("requestProcess").value);

  if (p < 0 || p >= n) {
    alert("Invalid Process Number");
    return;
  }

  const alloc = [], max = [], avail = [], request = [];

  for (let i = 0; i < n; i++) {
    alloc[i] = [];
    max[i] = [];
    for (let j = 0; j < m; j++) {
      alloc[i][j] = parseInt(document.getElementById(`allocation_${i}_${j}`).value) || 0;
      max[i][j] = parseInt(document.getElementById(`max_${i}_${j}`).value) || 0;
    }
  }

  for (let j = 0; j < m; j++) {
    avail[j] = parseInt(document.getElementById(`available_${j}`).value) || 0;
    request[j] = parseInt(document.getElementById(`request_${j}`).value) || 0;
  }

  // Calculate Need
  const need = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => max[i][j] - alloc[i][j])
  );

  // Check request <= need
  for (let j = 0; j < m; j++) {
    if (request[j] > need[p][j]) {
      alert("Error: Request exceeds process need.");
      return;
    }
  }

  // Check request <= available
  for (let j = 0; j < m; j++) {
    if (request[j] > avail[j]) {
      alert("Error: Resources not available.");
      return;
    }
  }

  // Pretend to allocate requested resources
  for (let j = 0; j < m; j++) {
    avail[j] -= request[j];
    alloc[p][j] += request[j];
    need[p][j] -= request[j];
  }

  // Check if safe
  const finish = Array(n).fill(false);
  const work = [...avail];
  const safeSeq = [];

  let count = 0;

  while (count < n) {
    let found = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        let exec = true;
        for (let j = 0; j < m; j++) {
          if (need[i][j] > work[j]) {
            exec = false;
            break;
          }
        }

        if (exec) {
          for (let j = 0; j < m; j++) work[j] += alloc[i][j];
          finish[i] = true;
          safeSeq.push("P" + i);
          count++;
          found = true;
        }
      }
    }

    if (!found) break;
  }

  const resultDiv = document.getElementById("requestResult");

  if (safeSeq.length === n) {
    resultDiv.className = "mt-4 alert alert-success";
    resultDiv.innerHTML = `Request can be <strong>Granted</strong>. New Safe Sequence: <strong>${safeSeq.join(" → ")}</strong>`;
  } else {
    resultDiv.className = "mt-4 alert alert-danger";
    resultDiv.innerHTML = `Request <strong>Cannot be Granted</strong> as it leads to an unsafe state.`;
  }

  resultDiv.style.display = "block";
}
