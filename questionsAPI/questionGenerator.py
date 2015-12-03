import wikipedia
import os.path
import shutil
import glob
from bs4 import BeautifulSoup
import requests
from nltk.corpus import wordnet as wn
from textblob import TextBlob
from nltk.tokenize import sent_tokenize
import string
import re

def extractTextFromWiki(topic):
    corpus = []
    r = requests.get("https://en.wikipedia.org/wiki/" + topic)
    soup = BeautifulSoup(r.text)
    text = soup.find(attrs={"class": "mw-content-ltr"})
    for i in text.find_all(['p']):
        try:
            corpus.append(str(i.text).strip())
        except: pass
    return corpus

def pickSentences(textList):
    sentences = ""
    for i in xrange(1,5):
        candidate = textList[i]
        try:
            if(len(candidate) < 200):
                continue
            else:
                sentences += (" " + candidate)
        except:
            pass
    return sent_tokenize(sentences)

def tokenize(text):
    return sent_tokenize(text)



def answerize(word):
    # In the absence of a better method, take the first synset
    synsets = wn.synsets(word, pos='n')
    # If there aren't any synsets, return an empty list
    if len(synsets) == 0:
        return []
    else:
        synset = synsets[0]
    # Get the hypernym for this synset (again, take the first)
    hypernym = synset.hypernyms()[0]
    # Get some hyponyms from this hypernym
    hyponyms = hypernym.hyponyms()
    # Take the name of the first lemma for the first 8 hyponyms
    similar_words = []
    counter = 0
    words = 0
    for hyponym in hyponyms:
        if words == 4:
                break
        counter += 1
        if(counter%2 == 0):
            similar_word = hyponym.lemmas()[0].name().replace('_', ' ')
            if similar_word != word:
                similar_words.append(similar_word)
                words += 1
    return similar_words

def questionize(sentenceList):
        questionList = []
        answersList = []
        #for sentence in sentenceList:
        current = ""
        sentence = sentenceList[1]
        print sentence
        sentence = TextBlob(sentence)
        for word,POS in sentence.tags:
            if(POS == "NN"):
                current +=  " " +  "__________"
                answers = answerize(word)
                answers.append(word)
                answersList.append(answers)
            else:
                current +=  " " +  str(word)
        questionList.append(current)
        return str(current + str(answersList))

corpus = extractTextFromWiki("calculus")
pickedSentences = pickSentences(corpus)
print questionize(pickedSentences)

#print get_similar_words("math")

