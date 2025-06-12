const form = document.getElementById('sortForm');
const urlParams = new URLSearchParams(window.location.search);

urlParams.forEach((value, key) => {
  if (!form.elements[key]) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
});
