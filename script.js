// Select the file input and the container
const fileInput = document.getElementById('fileInput');
const drawChartButton = document.getElementById('drawChart');
const container = d3.select("#course-list");
let coursesData = []; // To store parsed course data

// Define semester order
const semesterOrder = {
    "Winter": 1,
    "Fall": 2,
    "Summer": 3,
    "Spring": 4
};

// Handle file selection event
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        // Callback for when file reading is successful
        reader.onload = (e) => {
            try {
                // Parse the file content as JSON
                coursesData = JSON.parse(e.target.result);

                // Sort data by TermYear (descending) and TermSemesiter
                coursesData.sort((a, b) => {
                    if (b.TermYear !== a.TermYear) {
                        return b.TermYear - a.TermYear; // Sort by year descending
                    }
                    return semesterOrder[a.TermSemesiter] - semesterOrder[b.TermSemesiter]; // Sort by semester
                });

                // Clear the current content
                container.html("");

                // Render each course data as a card
                coursesData.forEach((course) => {
                    const card = container.append("div").attr("class", "card");

                    card.append("h3")
                        .text(course.CourseApartment + " " + course.CourseNumber);

                    card.append("p")
                        .html("<strong>Term:</strong> " + course.TermYear + " " + course.TermSemesiter);

                    card.append("p")
                        .html("<strong>Status:</strong> " + course.Status);

                    card.append("p")
                        .html("<strong>GPA:</strong> " + course.GPA_Letter);

						card.append("p")
                        .html("<strong>Credit Hours:</strong> " + course.CreditHour);

                });
            } catch (error) {
                alert("Error parsing JSON file.");
            }
        };

        // Read the file as text
        reader.readAsText(file);
    }
});

// Draw scatter plot when the button is clicked
drawChartButton.addEventListener('click', () => {
    drawScatterPlot(coursesData);
});

function drawScatterPlot(data) {
    // Clear the scatter plot area
    d3.select("#scatterplot").selectAll("*").remove();

    // Set the dimensions and margins for the scatter plot
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = +d3.select("#scatterplot").attr("width") - margin.left - margin.right;
    const height = +d3.select("#scatterplot").attr("height") - margin.top - margin.bottom;

    const svg = d3.select("#scatterplot")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a unique set of years
    const years = [...new Set(data.map(d => d.TermYear))];

    // Set the scales
    const x = d3.scalePoint()
        .domain(years) // Use unique years as the domain
        .range([0, width])
        .padding(0.5); // Optional: add padding between points

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.GPA_Number)]).nice()
        .range([height, 0]);

    // Add the x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add the y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Add the points
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.TermYear)) // X position based on x scale
        .attr("cy", d => y(d.GPA_Number)) // Y position based on y scale
        .attr("r", 5)
        .style("fill", "#69b3a2");
}
