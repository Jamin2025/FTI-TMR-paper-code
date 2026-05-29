const Counter = require('./util/counter')

class PrimaryVote {
    
    group = []
    
    votedForNode = -1

    tryVtCt = new Counter()

    voteMch = new Counter()

    constructor(isContactCorePF, getTerm, getPrimaryLeader, setPrimaryLeader, getNodeID, getSS) {
        this.isContactCorePF = isContactCorePF
        this.getTerm = getTerm
        this.getPrimaryLeader = getPrimaryLeader
        this.setPrimaryLeader = setPrimaryLeader
        this.getNodeID = getNodeID
        this.getSS = getSS
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

    reset() {
        this.group = []
        this.setPrimaryLeader(null)
        this.votedForNode = -1
    }

    vote(SSOfEachNode, nodes) {
        this.reset()
        if (this.isContactCorePF()) {
            // Do nothing, fault core may vote or not and it could vote a random node when it decide to vote
            const SS = Math.random() * 100
            const nodeIdx = Math.floor(Math.random() * nodes.length)
            this.votedForNode = nodes[nodeIdx].NodeID
            nodes[nodeIdx].primaryVote.receiveVote(SS);
        } else {
            // normal Node exclude the value that SS large than 1
            const votes = [...SSOfEachNode].sort((a, b) => {
                if (a[0] > 1) return 1
                if (b[0] > 1) return -1
                return b[0] - a[0]
            })
            const [SS, NodeID] = votes[0]
            this.votedForNode = NodeID
            nodes.find((node) => node.NodeID === NodeID).primaryVote.receiveVote(SS)
        }
        setTimeout(this.primaryLeaderVoteEnd.bind(this, SSOfEachNode, nodes), 200)
    }

    primaryLeaderVoteEnd(SSOfEachNode, nodes) {
        // broken leader core有一半的概率声称自己是leader core
        /* the node which has broken leader core has a probabily of 50% to declare himself as a leader*/
        if (this.isContactCorePF()) {
            if (Math.random() >= 0.5) {
                this.broadCastAsPrimaryLeader(nodes, this.getTerm());
            }
        }  else {
            const voteCount = this.voteMch.getCount()
            const half = Math.floor(nodes.length / 2)
            if (voteCount > half) {
                this.broadCastAsPrimaryLeader(nodes, this.getTerm());
            }
        }

        setTimeout(this.checkIfThereIsPrimaryLeader.bind(this, SSOfEachNode, nodes), 400)
        this.voteMch.reset()
        
    }

    broadCastAsPrimaryLeader(nodes, termFromLeader) {
        // notify it self
        for (let node of nodes) {
            node.primaryVote.tryAcceptPrimaryLeaderIs(this, this.getNodeID(), termFromLeader, nodes.length)
        }
        // wait the broadCastEnd to check if the group max than half, notify every node the group and select vice leader
        setTimeout(this.primaryBroadCastEnd.bind(this, nodes), 200);
    }

    tryAcceptPrimaryLeaderIs(LeaderPV, leaderID, termFromLeader, len) {
        // check if the term is the same, if it is, it accept that leader
        // 跟随自己投票的方且term一致的，如果没有保持原样。如果有双向通知。
        // 需要考虑坏掉的核心怎么做，首先坏掉的核心50%概率接受这个leader，并双向回信，也可能都接受，三种情况。
        if (this.isContactCorePF()) {
            const random = Math.random();
            if (random < 0.5) {
                // accept wrong Node
                this.setPrimaryLeader(Math.floor(Math.random() * len));
                LeaderPV.acceptMember(this.getNodeID(), this.getTerm())
            }
        } else {
            if (this.getTerm() === termFromLeader && this.votedForNode === leaderID) {
                this.setPrimaryLeader(leaderID)
                LeaderPV.acceptMember(this.getNodeID(), this.getTerm())
            }
        }
    }

    

    primaryBroadCastEnd(nodes) {
        // optional todo 坏的leader会怎么做呢？一半概率会宣称自己成为leader，和自己的member交换group，交换到正常的group会被拒绝
        if (this.group.length > Math.floor(nodes.length / 2)) {
            this.setPrimaryLeader(this.getNodeID())
            for (let nodeIdx of this.group) {
                if(nodeIdx !== this.getNodeID()) nodes[nodeIdx].primaryVote.notifyGroupFromLeader([...this.group])
            }
        }
    }

    notifyGroupFromLeader(group) {
        if (this.isContactCorePF()) {
            this.group = []
        } else {
            this.group = group
        }
    }

    acceptMember(NodeID, termFromNode) {
       
        if (termFromNode === this.getTerm()) {
            this.group.push(NodeID)
        }
    }

    checkIfThereIsPrimaryLeader(SSOfEachNode, nodes) {
        if (this.getPrimaryLeader() == null) {
            
            // try vote again
           
            if (this.tryVtCt.getCount() === 3) {
                this.tryVtCt.reset();
                console.log('node', this.getNodeID() + 1, 'failed at primary vote')
            } else {
                console.log('node', this.getNodeID() + 1, 'try primary vote again')
                this.vote(SSOfEachNode, nodes)
                this.tryVtCt.increase()
            }
            
            
             // let leader launch vice leader vote
        } else if (this.getPrimaryLeader() === this.getNodeID()) {
            this.tryVtCt.reset();
            const groupNodes = this.group.map(NodeID => nodes[NodeID])
            const SSOfEachGroupNode = this.group.map(NodeID => SSOfEachNode[NodeID])
            console.log('Leader', this.getNodeID(), "try vice vote and the group is" , this.group)
            // then vote a viceLeader from group
            for (let node of groupNodes) {
                node.viceVote.vote(SSOfEachGroupNode, groupNodes);
            }
        }
    }

}


module.exports = PrimaryVote