function HomePlace() {
    async function fetchData() {
        const response = await fetch('http://localhost:3000/semester/getFilterSemester');
        const data = await response.json();
        console.log(data);
    }

    return (
        <div>
            <h1>Home</h1>
        </div>
    );
}

export default HomePlace;