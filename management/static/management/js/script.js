document.addEventListener('DOMContentLoaded', function () {

    // Auto-dismiss success/error messages after 4 seconds
    document.querySelectorAll('.alert').forEach(function (alert) {
        setTimeout(function () {
            alert.style.transition = 'opacity 0.4s ease';
            alert.style.opacity = '0';
            setTimeout(function () {
                alert.remove();
            }, 400);
        }, 4000);
    });

    // Basic client-side sanity check on age fields (create/update forms)
    var ageInput = document.querySelector('input[name="age"]');
    if (ageInput) {
        var form = ageInput.closest('form');
        form.addEventListener('submit', function (e) {
            var age = parseInt(ageInput.value, 10);
            if (isNaN(age) || age <= 0 || age > 120) {
                e.preventDefault();
                showFieldError(ageInput, 'Enter a realistic age (1-120).');
            }
        });
    }

    function showFieldError(input, message) {
        var existing = input.parentElement.querySelector('.field-error');
        if (existing) {
            existing.textContent = message;
            return;
        }
        var errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        input.parentElement.appendChild(errorEl);
    }

    // Simple live search on the student list table, if present
    var table = document.getElementById('student-table');
    if (table) {
        var searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Search students...';
        searchBox.className = 'search-box';
        searchBox.style.marginBottom = '1rem';
        searchBox.style.width = '100%';
        searchBox.style.maxWidth = '280px';
        searchBox.style.padding = '0.5rem 0.7rem';
        searchBox.style.border = '1px solid #d1d5db';
        searchBox.style.borderRadius = '6px';
        searchBox.style.fontSize = '0.9rem';

        table.parentElement.insertAdjacentElement('beforebegin', searchBox);

        searchBox.addEventListener('input', function () {
            var query = searchBox.value.trim().toLowerCase();
            var rows = table.querySelectorAll('tbody tr');
            rows.forEach(function (row) {
                var text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
});
