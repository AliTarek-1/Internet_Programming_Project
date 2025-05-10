function approveProduct(btn) {
  const li = btn.parentElement;
  li.innerHTML += " ✅";
  btn.remove();
}

function markShipped(btn) {
  const row = btn.closest("tr");
  row.cells[2].innerText = "Shipped";
  btn.innerText = "Shipped";
  btn.disabled = true;
}
