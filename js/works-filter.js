/**
 * Works Page Filter Functionality
 *
 * Filters project thumbnails by category: All, Code, Object, Design
 */

$(document).ready(function() {
    // Filter button click handler
    $('.filter-btn').on('click', function(e) {
        e.preventDefault(); // Prevent default anchor behavior

        var filterValue = $(this).data('filter');

        // Update active state on filter buttons
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        // Show/hide projects based on filter
        if (filterValue === 'all') {
            // Show all projects
            $('.img_wrap').fadeIn(400);
        } else {
            // Hide all first
            $('.img_wrap').fadeOut(400);

            // Show only matching category after a short delay
            setTimeout(function() {
                $('.img_wrap[data-category="' + filterValue + '"]').fadeIn(400);
            }, 400);
        }
    });

    // Set "All" as active by default
    $('.filter-btn[data-filter="all"]').addClass('active');
});
