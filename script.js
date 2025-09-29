  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".subject").forEach(subject => {
      const text = subject.querySelector(".progress-text");
      const fill = subject.querySelector(".progress-fill");

      if (text && fill) {
        let percent = parseInt(text.textContent); // "45%" → 45
        if (!isNaN(percent)) {
          fill.style.width = percent + "%";

        }
      }
    });
  });

function showSection(sectionId) {
    const sections = ["academics", "extracurricular", "upcoming-events"];
    const headers = {
        "academics": "header-academics",
        "extracurricular": "header-extracurricular",
        "upcoming-events": "header-events"
    };

    sections.forEach(id => {
        const section = document.getElementById(id);
        const header = document.getElementById(headers[id]);

        if (section && header) {
            if (id === sectionId) {
                // Show section with correct display type
                const displayType = (id === "extracurricular") ? "flex" : "grid";
                section.style.display = displayType;
                header.style.display = "block";  // show corresponding header
            } else {
                section.style.display = "none";  // hide other sections
                header.style.display = "none";   // hide other headers
            }
        }
    });
}







