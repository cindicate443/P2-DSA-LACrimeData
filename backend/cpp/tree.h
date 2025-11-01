//
// Created by Christopher Silva on 10/26/25.
//
#pragma once
#ifndef TREE_H
#define TREE_H
#include <bits/stdc++.h>
//https://gist.github.com/Einstrasse/ac0fe7d7450621a39364ed3b05cacd11 use this and put it into that directory for bits/stdc++.h
#include "json.hpp" // include nlohmann json library
#include <filesystem>
using json = nlohmann::json; //Just for json abbreviation
using namespace std;

struct Node {
    Node* right = nullptr;
    Node* left = nullptr;
    string dr_num;
    string val;
    int count;
    Node(string& dr_num, string& val);
};

class CrimeTree {
    map<string, Node*> roots;

public:

    map<string, Node*> getRoots();

    void grabJsonData();


    void insertNode(string dr_num, string val);

    bool greaterString(const string &str1, const string &str2);

    Node* insertInSubtree(Node* node, Node* root);

    void bfsAlg();
    void dfsAlg();

    void inorderTraversal(Node* root);

    void printAllSubtrees();

};


#endif //TREE_H
