//
// Created by Christopher Silva on 10/26/25.
//
#include "tree.h"
#if __has_include(<filesystem>)
#include <filesystem>
namespace fs = std::filesystem;
#elif __has_include(<experimental/filesystem>)
#include <experimental/filesystem>
namespace fs = std::experimental::filesystem;
#else
#error "No filesystem support"
#endif

/*
 *bfs alg is self explanatory
 *nodes have a string for dr_num which is a unique value provided by dataset
 *string for val which would be any of the values. I think i wanted it to have a third value but i cant remember what
 *
 *roots are held in a map of string and nodes. string would hold the val so no two subtrees hold the same val
 *nodes would be the roots for the subtrees
 *
 *nodes have a left right
 *
 *not sure what insert record is but ill leave that in case someone wants to work  on it
 *
 *insert node checks if the val is already in the map. if not then it puts val in map and gives the inserted node as its root
 *if val found then itll insert it into the subtree using insertInSubtree
 *insertInSubtree is just recursive LNR order of trying to insert
 *
 *greater string is for us to find difference between dr numbers for organization in tree. the data set gives dr num as a
 *string for whatever reason so i tried my best to do the fastest way to find which is greater
 *
 *
 *nov 1
 *added print all subTrees
 *grab jsonData so it can now see the .json files and parse them using json.hpp
 *getRoots for really no reason other than testing
 *201 is the special number for controls.js to get exactly 100k vals. assuming ur doing 10 files
 *
 */


    Node::Node(string& dr_num, string& val) {
        this->dr_num = dr_num;
        this->val = val;
        count = 0;
        right = nullptr;
        left = nullptr;
    } 




    map<string, Node*> CrimeTree::getRoots() {
        return roots;
    }

    void CrimeTree::grabJsonData() {
        fs::path exePath = fs::current_path().parent_path().parent_path();
        for (int i = 0; i < 10; i++) {
            ostringstream oss;
            oss << "crimeData_" << i << ".json";
            fs::path dataDirectory = exePath / oss.str();

            ifstream ifs(dataDirectory);
            if (!ifs.is_open()) {
                cerr << "couldnt open " + oss.str() << endl;
                return;
            }

            json data = json::parse(ifs);
            for (int i = 0; i < data.size(); i++) {
                auto itr = data[i].begin();
                string dr_num;
                string val;
                while (itr != data[i].end()) {
                    if (itr.key() == "dr_no") {dr_num = data[i][itr.key()]; itr++; continue;}
                    else val = data[i][itr.key()];
                    itr++;
                }

                insertNode(dr_num, val);
            }
            ifs.close();
        }
    }

    void CrimeTree::insertNode(string dr_num, string val){
        if (roots.find(val) == roots.end()) {
            roots[val] = new Node(dr_num, val);
            return;
        }
        Node* node = new Node(dr_num, val);
        roots[val] = insertInSubtree(node, roots[val]);
        roots[val]->count++;
      }

    bool CrimeTree::greaterString(const string &str1, const string &str2) {
        for (int i =0 ; i < str1.size(); i++) {
            if (str1[i] - '0' > str2[i] - '0') return true;
            if (str2[i] - '0' > str1[i] - '0') return false;
        }
        return false;
    }

    Node* CrimeTree::insertInSubtree(Node* node, Node* root) {
        //LNR recursive form of insert
        if (!root) return node;
        if (greaterString(root->dr_num, node->dr_num)) { //change these to functions
            root->left = insertInSubtree(node, root->left);
        }else{
            root->right = insertInSubtree(node, root->right);
        }

        return root;
    }

    //now implement bfs and dfs
    void CrimeTree::bfsAlg() {
        valsForFrontEnd.clear();
        queue<Node*> q;
        auto itr = roots.begin();
        while (itr != roots.end()) {
            q.push(itr->second);
            itr++;
        }

        if (q.front() == nullptr) q.pop();
        while (!q.empty()) {
            int len = q.size();

            for (int i = 0; i < len; i++) {

                Node *node = q.front();
                q.pop();

                valsForFrontEnd[q.front()->val]++;
                cout << valsForFrontEnd[q.front()->val] <<" " << q.front()->val<< endl;

                if (node->left != nullptr)
                    q.push(node->left);

                if (node->right != nullptr)
                    q.push(node->right);
            }
        }


    }

    void CrimeTree::dfsAlg() {
        //basically inorder traversal right? i hope
        valsForFrontEnd.clear();
        auto itr = roots.begin();
        while (itr != roots.end()) {
            inorderTraversal(itr->second);

            itr++;
        }
    }

    void CrimeTree::inorderTraversal(Node* root) {
        //LNR
        if (root == nullptr) return;

        inorderTraversal(root->left);
        //there is one dr_no that is particularly small. its 0817.
        //everything should still work so i hope that doesnt ruin stuff

        cout << valsForFrontEnd[root->val]++ << " " << root->val << endl;

        // this->count++;
        inorderTraversal(root->right);

    }

    void CrimeTree::printAllSubtrees() {
        auto itr = roots.begin();

        while (itr != roots.end()) {
            inorderTraversal(itr->second);
            // cout << this->count << endl;
            itr++;
        }
    }

