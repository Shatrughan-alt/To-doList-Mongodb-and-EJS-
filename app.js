//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

//tells to use ejs 
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
    name:String
}
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your todolist!"
});
const item2=new Item({
    name:"Hit the + butoon to add a new item"
});
const item3=new Item({
    name:"<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", function (req, res) {
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully saved default items to DB");
                }
            });
        }
       
        else{
        res.render("list", { listtitle: "Today",newlistitems:foundItems});
        }
    });

});
app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                //Create a new list
                const list=new List({
                    name:customListName,
                    items:defaultItems
                })
                list.save();
                res.redirect("/" + customListName);
            }
            
            else{
                //Show an existing list
                res.render("list",{listtitle:foundList.name,newlistitems:foundList.items})
            }
            
        }
    });

   

});

app.post("/",function(req,res){
    const itemname=req.body.newItem;
    const listname=req.body.list;

    const item=new Item({
        name:itemname
    });

    if(listname==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listname},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listname);
        });
    }
   

})

app.post("/delete",function(req,res){
    const checkeditemid=req.body.checkbox;
    const listname=req.body.listname;

    if(listname==="Today"){
        Item.findByIdAndRemove(checkeditemid,function(err){
            if(!err){
            console.log("Successfully deleted checked item.");
            res.redirect("/");
            }
        });    
    }else{
        List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkeditemid}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listname);
            }
        });
    }
   
});


app.get("/work",function(req,res){
    res.render("list",{listtitle:"Work List",newlistitems:workitems});
});

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});


// var currentday = today.getDay();
//     var day = "";

//     switch (currentday) {
//         case 0:
//             day = "Sunday";
//             break;
//         case 1:
//             day = "Monday";
//             break;

//         case 2:
//             day = "Tuesday";
//             break;
//         case 3:
//             day = "Wednesday";
//             break;
//         case 4:
//             day = "Thursday";
//             break;
//         case 5:
//             day = "Friday";
//             break;
//         case 6:
//             day = "Saturday";
//             break;
//         default:
//             console.log("Error: current day is equal to: " + currentday);
//     }