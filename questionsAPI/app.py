#!flask/bin/python
from flask import Flask, jsonify
from bs4 import BeautifulSoup
import requests
from nltk.corpus import wordnet as wn
from textblob import TextBlob
from nltk.tokenize import sent_tokenize, word_tokenize
from flask.ext.cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/<subject>')
def index(subject):
    def extractTextFromWiki(topic):
        corpus = []
        r = requests.get("https://en.wikipedia.org/wiki/" + topic)
        soup = BeautifulSoup(r.text)
        text = soup.find(attrs={"class": "mw-content-ltr"})
        for i in text.find_all(['p']):
            try:
                corpus.append(str(i.text).strip())
            except:
                pass
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

    def answerize(word):
        related = wn.synsets(word, pos='n')
        if len(related) == 0:
            return []
        else:
            synset = related[0]
        hypernym = synset.hypernyms()[0]
        hyponyms = hypernym.hyponyms()
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
        json = {}
        foundQuestion = False
        #for sentence in sentenceList:
        current = ""
        sentence = sentenceList[1]
        #print sentence
        sentence = TextBlob(sentence)
        for word,POS in sentence.tags:
            if(POS == "NN" and foundQuestion == False):
                current +=  " " +  "__________"
                answers = answerize(word)
                answers.append(word)
                answersList.append(answers)
                foundQuestion = True
            else:
                current +=  " " +  str(word)
        questionList.append(current)
        json["question"] = current
        json["answers"] = answersList[0]
        return jsonify(json)

    corpus = extractTextFromWiki(subject)
    pickedSentences = pickSentences(corpus)
    return questionize(pickedSentences)


@app.route('/query/<query>')
def search(query):
    def getInformation(query):
        r = requests.get("https://en.wikipedia.org/wiki/" + query)
        corpus = []
        soup = BeautifulSoup(r.text)
        text = soup.find(attrs={"class": "mw-content-ltr"})
        for i in text.find_all(['p']):
            try:
                corpus.append(str(i.text).strip())
            except:
                pass
        return corpus


    def tfidf(query, words):
        documents = []
        corpusFreq = {}
        def addDocument(doc, wordFreq):
            dict = {}
            for word in wordFreq:
                dict[word] = 1+dict.get(word, 0.0)
                corpusFreq[word] = 1+corpusFreq.get(word, 0.0)
            for k in dict:
                dict[k] = dict[k]/float(len(wordFreq))
            documents.append([doc, dict])

        # Populate documents and corpusFreq
        docs = getInformation(query)
        for i in docs:
            print word_tokenize(i)
            addDocument(str(i), word_tokenize(i))

        def similarities(queries):
            highScore = 0
            highDoc = "No relevant information!"
            queryFreq = {}
            for word in queries:
                queryFreq[word] = queryFreq.get(word, 0.0)+1
            for k in queryFreq:
                queryFreq[k] = queryFreq[k] / float(len(queries))
            for doc in documents:
                score = 0.0
                doc_dict = doc[1]
                for word in queryFreq:
                    if doc_dict.has_key(word):
                        score += (queryFreq[word]/corpusFreq[word])+(doc_dict[word] / corpusFreq[word])
                if(score > highScore):
                    highScore = score
                    highDoc = doc[0]
            return highDoc

        return similarities(words)

    queries = query.split('_')
    json = {"answer": tfidf(queries[0], [queries[1]])}
    return jsonify(json)


if __name__ == '__main__':
    app.run(debug=True)
