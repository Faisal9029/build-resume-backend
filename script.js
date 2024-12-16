document.getElementById('resume-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form from reloading the page

    // Collect data from form
    const name = document.getElementById('name').value;
    const fname = document.getElementById('f_name').value;  // Ensure this element has the correct ID
    const cnic = document.getElementById('CNIC').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const education = document.getElementById('education').value;
    const experience = document.getElementById('experience').value;
    const skills = document.getElementById('skills').value;
    const profilePicture = document.getElementById('profilepicture').files[0];

    // Prepare the form data (including file)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('fname', fname);  // Ensure 'fname' is correctly added
    formData.append('cnic', cnic);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('education', education);
    formData.append('experience', experience);
    formData.append('skills', skills);
    formData.append('profilePicture', profilePicture);

    // Send the form data to backend
    fetch('http://localhost:3000/create-resume', {
        method: 'POST',
        body: formData,  // Use FormData to send the data
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            // Display the generated URL
            const resumeLink = document.getElementById('resume-link');
            resumeLink.innerHTML = `<a href="${data.url}" target="_blank">Click here to view your resume</a>`;
        } else {
            console.error('Error in response:', data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
