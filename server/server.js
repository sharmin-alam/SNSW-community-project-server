const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const storage = require('node-persist');
const { v4: uuidv4 } = require('uuid');
const server = express();
// export default server;

(async () => {
    await storage.init({ dir: './data' })

    server.use(express.json());
    server.use(bodyParser.json());
    server.use(cors());

    //gets all approved projects
    server.get('/projects/approved', async (req, res) => {
        let projects = await storage.valuesWithKeyMatch(/project-/);
        let filteredResults = projects.filter(project => project.status == "approved")
        res.json({ status: 200, data: filteredResults })
    })



    server.get('/projects/pending', async (req, res) => {
        let projects = await storage.valuesWithKeyMatch(/project-/);
        let filteredResults = projects.filter(project => project.status == "pending")
        res.status(200).json(filteredResults)
    })



    server.get('/projects/declined', async (req, res) => {
        let projects = await storage.valuesWithKeyMatch(/project-/);
        let filteredResults = projects.filter(project => project.status == "declined")
        res.status(200).json(filteredResults)
    })


    //post handler for project submissions

    server.post('/projects/submissions', async (req, res) => {
        try {
            let project = {
                id: uuidv4(),
                name: req.body.name,
                postcode: Number(req.body.postcode),
                description: req.body.description,
                title: req.body.title,
                status: "pending",
                grantAmount:req.body.grantAmount,
                timeStamp: new Date().toISOString().slice(0, 17),
                voteCount: 0
            }
            if (isNaN(project.postcode)) {
                res.json({ status: 500, message: "Please enter a valid post code" })
            }
            else if (project.title.length > 50) {
                res.json({ status: 500, message: "Title must be below 50 characters" })
            }
            else if (project.description.length > 300) {
                res.json({ status: 500, message: "Description must be below 300 characters" })

            }
            else if (project.name.length > 50) {
                res.json({ status: 500, message: "Name must be below 50 characters" })

            }
            else if (project.postcode < 1999 || project.postcode > 3000) {
                res.json({ status: 500, message: "Please enter a valid post code" })

            }
            else if (project.title == '') {
                res.json({ status: 500, message: "Please enter a valid title" })
            }

            else if (typeof project.name !== "string") {
                res.json({ status: 500, message: "Please enter a valid name" })

            }
            else if (project.postcode > 3000) {
                res.json({ status: 500, message: "Please enter a valid post code" })

            }
            else if (project.name == "") {
                res.json({ status: 500, message: "Please enter a valid name" })
            }
            else if (project.description == "") {
                res.json({ status: 500, message: "Please enter a description" })
            }
            else if (typeof project.name !== "string") {
                res.json({ status: 500, message: "Please enter a valid name" })
            }
            else if (typeof project.description !== "string") {
                res.json({ status: 500, message: "Please enter a valid description" })

            }
            else {
                await storage.setItem(`project-${project.id}`, project);
                res.json({ status: 200, data: project });
            }
        }
        catch (error) {
            res.json({ status: 500, message: error.message });
        };
    });


// post handler for search
//////////////////////
server.post('/projects/search', async (req, res) => {
    try {
        let searchTerm = req.body.searchterm.toLowerCase();

        if (searchTerm == '') {
            res.json({ status: 500, message: "Please enter a valid search title" })
        }
       
       else {
            
                let project = await storage.valuesWithKeyMatch(/project-/);
                let filteredResults = project.filter(project => Object.keys(project).some(key => project[key].toString().toLowerCase().includes(searchTerm)))
                let result = filteredResults.filter(p => p.status == "approved")
                res.json(result)  
       }        
    }
    catch (error) {
        res.json({ status: 500, message: error.message });
    };
});

//////////////////////
    //post handler for votes
    server.put('/projects/approved/vote', async (req, res) => {
        let toVote = req.body.id
        let project = await storage.getItem(`project-${toVote}`)
        ++project.voteCount
        await storage.updateItem(`project-${project.id}`, project)
        res.json({ status: 200, data: project })
    })
    //post handler for project searches
    server.get('/projects/search/:seachTerm', async (req, res) => {

        try {
            if (req.params.search != "") {
                let searchTerm = req.params.search.toLowerCase()
                let project = await storage.valuesWithKeyMatch(/project-/);
                let filteredResults = project.filter(project => Object.keys(project).some(key => project[key].toString().toLowerCase().includes(searchTerm)))
                let result = filteredResults.filter(p => p.status == "approved")
                res.json(result)
            }
            else {
                res.json({ status: 200, message: sucessful });
            }
        }
        catch (error) {
            res.json({ status: 500, message: error.message });
        };

    });

    //get handler for searching approved project
    server.get('/search', async (req, res) => {
        const {searchTerm} = req.query;
        let projects = await storage.valuesWithKeyMatch(/project-/);
        let approvedProject = projects.filter(project => project.status == "approved");
        let finalSearchResult = approvedProject.filter(project => project.title == searchTerm);
        res.json(finalSearchResult);

    });


    //post handler for approving pending projects
    server.put('/projects/approve', async (req, res) => {
        try {
            let toApprove = req.body.id;
            let project = await storage.getItem(`project-${toApprove}`)
            if (project.status != "approved") {
                project.status = "approved"
                await storage.updateItem(`project-${project.id}`, project)
                res.json({ status: 200, data: project });
            } else {
                res.json({ status: 500, message: error.message });
            }
        } catch (error) {
            res.json({ status: 500, message: error.message });
        };
    })
    //post handler for declining projects
    server.put('/projects/decline', async (req, res) => {
        try {
            let toDecline = req.body.id;
            let project = await storage.getItem(`project-${toDecline}`)
            if (project.status != "decline") {
                project.status = "decline"
                await storage.updateItem(`project-${project.id}`, project)
                res.json({ status: 200, data: project });
            } else {
                res.json({ status: 500, message: error.message });

            }
        } catch (error) {
            res.json({ status: 500, message: error.message });
        };
    })

    server.get('/projects/popular', async (req, res) => {
        let projects = await storage.valuesWithKeyMatch(/project-/)
        let filteredResults = projects.filter(project => project.status == "approved")
        let sortedProjects = filteredResults.sort((a, b) => {
            return (b.voteCount - a.voteCount)
        })
        if (sortedProjects.length < 10) {
            sortedProjects.rank= 0
            res.json(sortedProjects)
        } else {
            sortedProjects.length = 10
            res.json(sortedProjects)
        }
    })

    server.listen(4000, () => {
        console.log('The server is listening on port 4000 http://localhost:4000');
    });
})();

