const Counter = require('./util/counter');

class ViceVote {

    viceGroup = []

    votedForNode = -1

    voteMch = new Counter();

    constructor(isContactCorePF, getTerm, getPrimaryLeader, getViceLeader, setViceLeader, getNodeID, getSS) {
        this.isContactCorePF = isContactCorePF
        this.getTerm = getTerm
        this.getPrimaryLeader = getPrimaryLeader
        this.getViceLeader = getViceLeader
        this.setViceLeader = setViceLeader
        this.getNodeID = getNodeID
        this.getSS = getSS
    }

    setVoteResolve(v) {
        this.voteResolve = v
    }

    reset() {
        this.viceGroup = []
        this.setViceLeader(null)
    }

    vote(SSOfEachGroupNode, groupNodes) {
        this.reset()
        if (this.isContactCorePF()) {
            // Do nothing, fault core may vote or not and it could vote a random node when it decide to vote
            const SS = Math.random() * 100
            const nodeIdx = Math.floor(Math.random() * groupNodes.length)
            this.votedForNode = groupNodes[nodeIdx].NodeID
            groupNodes[nodeIdx].viceVote.receiveVote(SS);
        } else {
            // normal Node exclude the value that SS large than 1
            const votes = SSOfEachGroupNode.filter(([_, NodeID]) => NodeID !== this.getPrimaryLeader()).sort((a, b) => {
                if (a[0] > 1) return 1
                if (b[0] > 1) return -1
                return b[0] - a[0]
            })
            let SS, NodeID;
            if (votes.length) {
                [SS, NodeID] = votes[0]
            } else {
                console.error(votes, SSOfEachGroupNode, groupNodes, this.getNodeID(), this.isContactCorePF())
                return  setTimeout(this.viceLeaderVoteEnd.bind(this, SSOfEachGroupNode, groupNodes), 200)
            }
            this.votedForNode = NodeID
            groupNodes.find((node) => node.NodeID === NodeID).viceVote.receiveVote(SS)
        }
        setTimeout(this.viceLeaderVoteEnd.bind(this, SSOfEachGroupNode, groupNodes), 200)
    }

    /* 获得投票 */
    /* 
        Collect all votes, if this leader core is perment fault, it will reject that vote or not
        If not broken, it will check whether or not the SS value same as himself,
        If it is, it will recieve that vote, if not, reject that vote. Let SS as payload when voting.
    */
    receiveVote(SS) {
        // 拒绝已经选出leader group外部的投票。
        if (!this.isContactCorePF()) {
            if (SS === this.getSS()) {
                this.voteMch.increase()
            }
        }
    }


    viceLeaderVoteEnd(SSOfEachGroupNode, groupNodes) {
        // broken leader core有一半的概率声称自己是vice leader core
        /* the node which has broken leader core has a probabily of 50% to declare himself as a leader*/
        if (this.isContactCorePF()) {
            if (Math.random() >= 0.5) {
                this.broadCastAsViceLeader(groupNodes, this.getTerm());
            }
        }  else {
            const voteCount = this.voteMch.getCount()
            const half = Math.floor(groupNodes.length / 2)
            if (voteCount > half) {
                this.broadCastAsViceLeader(groupNodes, this.getTerm());
            }
        }

        setTimeout(this.checkIfThereIsViceLeader.bind(this, SSOfEachGroupNode, groupNodes), 400)
        this.voteMch.reset()
    }

    broadCastAsViceLeader(groupNodes, termFromLeader) {
        // notify it self
        for (let node of groupNodes) {
            node.viceVote.tryAcceptViceLeaderIs(this, this.getNodeID(), termFromLeader, groupNodes.length)
        }
        // wait the broadCastEnd to check if the group max than half, notify every node the group and select vice leader
        setTimeout(this.viceBroadCastEnd.bind(this, groupNodes), 200);
    }

    tryAcceptViceLeaderIs(ViceLeaderVv, leaderID, termFromLeader, len) {
        // check if the term is the same, if it is, it accept that leader
        if (this.isContactCorePF()) {
            const random = Math.random();
            if (random < 0.5) {
                // accept wrong Node
                this.setViceLeader(Math.floor(Math.random() * len));
                ViceLeaderVv.acceptMember(this.getNodeID(), this.getTerm())
            }
        } else {
            if (this.getTerm() === termFromLeader && this.votedForNode === leaderID) {
                this.setViceLeader(leaderID);
                ViceLeaderVv.acceptMember(this.getNodeID(), this.getTerm())
            }
        }
    }

    acceptMember(NodeID, termFromNode) {
        // console.log('vice leader ', this.getNodeID() , ' try accept group member', NodeID, 'leader term ', this.getTerm(), ' member term ', termFromNode)
        if (termFromNode === this.getTerm()) {
            this.viceGroup.push(NodeID)
        }
    }

    viceBroadCastEnd(groupNodes)  {
        // determinate itself as vice leader
        if (this.viceGroup.length > Math.floor(groupNodes.length / 2)) {
            this.setViceLeader(this.getNodeID())
        }
    }

    checkIfThereIsViceLeader(SSOfEachGroupNode, groupNodes) {
        if (this.getViceLeader() == null) {
            console.log("node", this.getNodeID(), 'primary leader ',this.getPrimaryLeader(), "try vice vote again")
            // try vote again
            this.vote(SSOfEachGroupNode, groupNodes)
        } else {
            console.log("resolved", this.getNodeID(), this.getPrimaryLeader(), this.getViceLeader())
            this.voteResolve([[this.getPrimaryLeader(), this.getViceLeader()], this.getNodeID()])
        }
    }
}

module.exports = ViceVote
